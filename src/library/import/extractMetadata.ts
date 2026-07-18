import { parseBlob } from 'music-metadata'
import type { IAudioMetadata, ICommonTagsResult, IFormat } from 'music-metadata'

export interface ExtractedMetadata {
  title?: string
  artist?: string
  albumArtist?: string
  album?: string
  genre?: string
  year?: number
  trackNo?: number
  discNo?: number
  duration?: number
  format?: string
  bitrate?: number
  sampleRate?: number
  /** Embedded artwork (if any) as a Blob. */
  artworkBlob?: Blob
  /** Raw lyrics (USLT/SYLT for ID3; equivalent for other formats). */
  lyrics?: string
}

/**
 * Extract metadata from an audio File using the `music-metadata` library.
 * Resolves with whatever fields were available — never throws on partial data.
 */
export async function extractMetadata(file: File): Promise<ExtractedMetadata> {
  let parsed: IAudioMetadata
  try {
    parsed = await parseBlob(file)
  } catch (err) {
    console.warn(`metadata: failed to parse ${file.name}`, err)
    return {}
  }

  const common: ICommonTagsResult = parsed.common ?? {}
  const format: IFormat = parsed.format ?? {}

  // Extract embedded artwork to a Blob (preserve mime type)
  let artworkBlob: Blob | undefined
  const picture = common.picture?.[0]
  if (picture) {
    artworkBlob = new Blob([new Uint8Array(picture.data)], {
      type: picture.format || 'image/jpeg',
    })
  }

  return {
    title: common.title?.trim() || undefined,
    artist: common.artist?.trim() || undefined,
    albumArtist: common.albumartist?.trim() || undefined,
    album: common.album?.trim() || undefined,
    genre: common.genre?.[0]?.trim() || undefined,
    year: common.year || undefined,
    trackNo: common.track?.no ?? undefined,
    discNo: common.disk?.no ?? undefined,
    duration: format.duration || undefined,
    format: format.container || file.type || undefined,
    bitrate: format.bitrate || undefined,
    sampleRate: format.sampleRate || undefined,
    artworkBlob,
    lyrics: typeof common.lyrics === 'string'
      ? common.lyrics
      : Array.isArray(common.lyrics) && common.lyrics[0]
        ? (() => {
            const first = common.lyrics[0] as unknown
            if (typeof first === 'string') return first
            const maybeLine = (first as { line?: string }).line
            return maybeLine ?? undefined
          })()
        : undefined,
  }
}
