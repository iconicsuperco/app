import { db } from './db'
import type { Track, PlayHistoryEntry, LibraryStats } from '@/types'

/**
 * Query functions for use with `useLiveQuery()` from dexie-react-hooks.
 *
 * Each export is a () => Promise<T> querier. Wrap with useLiveQuery in React:
 *   const tracks = useLiveQuery(allTracksQuery)
 */
// ─── Collection queries ────────────────────────────────────────

export const allTracksQuery = () =>
  db.tracks.toArray().then((tracks) => tracks.sort((a, b) => a.title.localeCompare(b.title)))

export const allAlbumsQuery = () =>
  db.albums.toArray().then((albums) => albums.sort((a, b) => a.title.localeCompare(b.title)))

export const allArtistsQuery = () =>
  db.artists.toArray().then((artists) => artists.sort((a, b) => a.name.localeCompare(b.name)))

export const allPlaylistsQuery = () =>
  db.playlists
    .toArray()
    .then((playlists) => playlists.sort((a, b) => b.updatedAt - a.updatedAt))

export const recentlyAddedTracksQuery = (limit = 50) =>
  db.tracks.orderBy('dateAdded').reverse().limit(limit).toArray()

export const recentlyPlayedQuery = (limit = 50) =>
  (async (): Promise<{ entry: PlayHistoryEntry; track: Track }[]> => {
    const history = await db.playHistory.orderBy('playedAt').reverse().limit(limit).toArray()
    const results: { entry: PlayHistoryEntry; track: Track }[] = []
    for (const entry of history) {
      const track = await db.tracks.get(entry.trackId)
      if (track) results.push({ entry, track })
    }
    return results
  })()

export const favoriteTracksQuery = () =>
  db.tracks.toArray().then((tracks) =>
    tracks
      .filter((t) => t.isFavorite)
      .sort((a, b) => a.title.localeCompare(b.title)),
  )

// ─── Detail queries ───────────────────────────────────────────

export const albumByIdQuery = (id: string) =>
  (async () => {
    const album = await db.albums.get(id)
    if (!album) return null
    const tracks = await db.tracks.where('id').anyOf(album.trackIds).toArray()
    tracks.sort(
      (a, b) =>
        (a.discNo ?? 1) - (b.discNo ?? 1) || (a.trackNo ?? 0) - (b.trackNo ?? 0),
    )
    return { album, tracks }
  })()

export const artistByIdQuery = (id: string) =>
  (async () => {
    const artist = await db.artists.get(id)
    if (!artist) return null
    const albums = await db.albums.where('id').anyOf(artist.albumIds).toArray()

    // Track.album stores album title (not album id), so join via album titles.
    const albumTitles = Array.from(new Set(albums.map((a) => a.title)))
    const tracks = await db.tracks.where('album').anyOf(albumTitles).toArray()

    tracks.sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
    return { artist, albums, tracks }
  })()

export const playlistByIdQuery = (id: string) =>
  (async () => {
    const playlist = await db.playlists.get(id)
    if (!playlist) return null
    const trackMap = await db.tracks.bulkGet(playlist.trackIds)
    const tracks = trackMap.filter((t): t is Track => t !== undefined)
    return { playlist, tracks }
  })()

// ─── Stats ──────────────────────────────────────────────────────

export const libraryStatsQuery = () =>
  (async (): Promise<LibraryStats> => {
    const [trackCount, albumCount, artistCount, playlistCount, tracks] = await Promise.all([
      db.tracks.count(),
      db.albums.count(),
      db.artists.count(),
      db.playlists.count(),
      db.tracks.toArray(),
    ])
    return {
      trackCount,
      albumCount,
      artistCount,
      playlistCount,
      totalDuration: tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0),
    }
  })()

// ─── One-shot queries (for non-reactive contexts) ──────────────

export async function getTrack(trackId: string): Promise<Track | undefined> {
  return db.tracks.get(trackId)
}

export async function getAllTrackIds(): Promise<string[]> {
  const tracks = await db.tracks.toCollection().toArray()
  return tracks.map((t) => t.id)
}

export async function toggleFavorite(trackId: string): Promise<void> {
  const track = await db.tracks.get(trackId)
  if (track) {
    await db.tracks.update(trackId, { isFavorite: !track.isFavorite })
  }
}

// ─── Playlist mutations ──────────────────────────────────────────

export async function createPlaylist(name: string): Promise<string> {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.playlists.put({
    id,
    name,
    trackIds: [],
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function renamePlaylist(id: string, name: string): Promise<void> {
  await db.playlists.update(id, { name, updatedAt: Date.now() })
}

export async function deletePlaylist(id: string): Promise<void> {
  await db.playlists.delete(id)
}

export async function addTrackToPlaylist(
  playlistId: string,
  trackId: string,
): Promise<void> {
  const playlist = await db.playlists.get(playlistId)
  if (playlist && !playlist.trackIds.includes(trackId)) {
    playlist.trackIds.push(trackId)
    await db.playlists.put({ ...playlist, updatedAt: Date.now() })
  }
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  trackId: string,
): Promise<void> {
  const playlist = await db.playlists.get(playlistId)
  if (playlist) {
    playlist.trackIds = playlist.trackIds.filter((id) => id !== trackId)
    await db.playlists.put({ ...playlist, updatedAt: Date.now() })
  }
}

// ─── Blob access ─────────────────────────────────────────────────

export async function getArtworkBlob(artworkId?: string): Promise<Blob | null> {
  if (!artworkId) return null
  const record = await db.artworkBlobs.get(artworkId)
  return record ? record.blob : null
}
