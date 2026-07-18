import { db } from '@/library/db'
import { extractMetadata } from './extractMetadata'
import { guessFromFilename } from './guessFromFilename'
import { extractPalette } from './extractPalette'
import type { Track, Album, Artist, ColorPalette, ImportProgress } from '@/types'

const SUPPORTED_EXTS = [
  '.mp3', '.m4a', '.aac', '.flac', '.ogg', '.opus', '.wav', '.wma', '.webm',
] as const

/** Callback invoked after each file is processed. */
export type ProgressCallback = (progress: ImportProgress) => void

export interface ImportResult {
  imported: number
  failed: number
  errors: { file: string; error: string }[]
}

/**
 * Import a batch of audio files into the library.
 *
 * Pipeline per file:
 *   1. Extract metadata via `music-metadata`
 *   2. Fall back to filename guessing for any missing fields
 *   3. Extract color palette from embedded artwork
 *   4. Persist audio Blob + artwork Blob + Track record to IndexedDB
 *   5. Auto-group into Album / Artist collections
 *
 * The caller receives progress updates via `onProgress` after each file.
 */
export async function importFiles(
  files: File[],
  onProgress?: ProgressCallback,
): Promise<ImportResult> {
  // Filter to supported audio files only
  const audioFiles = files.filter((f) =>
    SUPPORTED_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext)),
  )

  const progress: ImportProgress = {
    total: audioFiles.length,
    completed: 0,
    failed: 0,
    errors: [],
  }

  if (audioFiles.length === 0) {
    return { imported: 0, failed: 0, errors: [] }
  }

  for (const file of audioFiles) {
    progress.currentFile = file.name
    try {
      await importSingleFile(file)
      progress.completed++
    } catch (err) {
      progress.failed++
      const message = err instanceof Error ? err.message : String(err)
      progress.errors.push({ file: file.name, error: message })
      console.warn(`import: failed to import ${file.name}`, err)
    }
    onProgress?.({ ...progress, errors: [...progress.errors] })
  }

  return {
    imported: progress.completed,
    failed: progress.failed,
    errors: progress.errors,
  }
}

/** Process a single file: extract → merge → persist. */
async function importSingleFile(file: File): Promise<void> {
  // 1. Parse embedded metadata
  const meta = await extractMetadata(file)

  // 2. Fill gaps from filename
  const guess = guessFromFilename(file.name)
  const title = meta.title ?? guess.title ?? stripExtension(file.name)
  const artist = meta.artist ?? guess.artist ?? 'Unknown Artist'
  const albumArtist = meta.albumArtist ?? artist
  const album = meta.album ?? 'Unknown Album'
  const trackNo = meta.trackNo ?? guess.trackNo

  // 3. De-duplicate by file content hash (skip if already imported)
  const fileId = await makeFileId(file)
  const existing = await db.tracks.where('blobId').equals(fileId).first()
  if (existing) {
    // Already in library — skip silently
    return
  }

  // 4. Extract palette from artwork (best-effort, non-blocking on failure)
  let palette: ColorPalette | undefined
  let artworkId: string | undefined
  if (meta.artworkBlob) {
    try {
      const extracted = await extractPalette(meta.artworkBlob)
      palette = extracted ?? undefined
    } catch {
      // palette is a nice-to-have
    }
    artworkId = crypto.randomUUID()
    await db.artworkBlobs.put({ id: artworkId, blob: meta.artworkBlob })
  }

  // 5. Store audio Blob
  await db.audioBlobs.put({ id: fileId, blob: file })

  // 6. Persist Track record
  const trackId = crypto.randomUUID()
  const track: Track = {
    id: trackId,
    blobId: fileId,
    artworkId,
    title,
    artist,
    albumArtist,
    album,
    genre: meta.genre,
    year: meta.year,
    trackNo,
    discNo: meta.discNo,
    duration: meta.duration ?? 0,
    format: meta.format,
    bitrate: meta.bitrate,
    sampleRate: meta.sampleRate,
    lyrics: meta.lyrics,
    palette,
    isFavorite: false,
    dateAdded: Date.now(),
    playCount: 0,
  }
  await db.tracks.put(track)

  // 7. Update Album + Artist collections
  await upsertAlbum(track)
  await upsertArtist(track)
}

/** Create or update the Album grouping for a track. */
async function upsertAlbum(track: Track): Promise<void> {
  if (!track.album) return
  const albumId = makeAlbumId(track.album, track.albumArtist ?? track.artist)
  const existing = await db.albums.get(albumId)
  if (existing) {
    if (!existing.trackIds.includes(track.id)) {
      existing.trackIds.push(track.id)
    }
    if (!existing.artworkId && track.artworkId) {
      existing.artworkId = track.artworkId
    }
    if (!existing.palette && track.palette) {
      existing.palette = track.palette
    }
    await db.albums.put(existing)
  } else {
    const album: Album = {
      id: albumId,
      title: track.album,
      albumArtist: track.albumArtist ?? track.artist,
      year: track.year,
      artworkId: track.artworkId,
      palette: track.palette,
      trackIds: [track.id],
    }
    await db.albums.put(album)
  }
}

/** Create or update the Artist entry for a track. */
async function upsertArtist(track: Track): Promise<void> {
  const artistId = makeArtistId(track.artist)
  const existing = await db.artists.get(artistId)
  const albumId = track.album ? makeAlbumId(track.album, track.albumArtist ?? track.artist) : null

  if (existing) {
    if (albumId && !existing.albumIds.includes(albumId)) {
      existing.albumIds.push(albumId)
    }
    existing.trackCount++
    await db.artists.put(existing)
  } else {
    const artist: Artist = {
      id: artistId,
      name: track.artist,
      albumIds: albumId ? [albumId] : [],
      trackCount: 1,
    }
    await db.artists.put(artist)
  }
}

// ─── ID helpers ────────────────────────────────────────────────

/** Stable content-based id from file size + name + last modified. */
async function makeFileId(file: File): Promise<string> {
  // Use file metadata rather than hashing the whole blob — fast + good enough for dedup
  const seed = `${file.name}:${file.size}:${file.lastModified}`
  return slug(seed)
}

function makeAlbumId(title: string, artist: string): string {
  return slug(`album:${title}:${artist}`)
}

function makeArtistId(name: string): string {
  return slug(`artist:${name}`)
}

/** Convert a string to a stable URL-safe slug. */
function slug(str: string): string {
  return str.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function stripExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(0, dot) : name
}
