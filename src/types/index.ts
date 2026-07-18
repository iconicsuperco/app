/** Core domain types for Muse */

export interface Track {
  id: string
  blobId: string
  artworkId?: string
  title: string
  artist: string
  albumArtist?: string
  album?: string
  genre?: string
  year?: number
  trackNo?: number
  discNo?: number
  duration: number
  format?: string
  bitrate?: number
  sampleRate?: number
  lyrics?: string
  palette?: ColorPalette
  isFavorite: boolean
  dateAdded: number
  lastPlayed?: number
  playCount: number
}

export interface Album {
  id: string
  title: string
  albumArtist?: string
  year?: number
  artworkId?: string
  palette?: ColorPalette
  trackIds: string[]
}

export interface Artist {
  id: string
  name: string
  albumIds: string[]
  trackCount: number
}

export interface Playlist {
  id: string
  name: string
  description?: string
  artworkId?: string
  trackIds: string[]
  createdAt: number
  updatedAt: number
}

export interface PlayHistoryEntry {
  id: string
  trackId: string
  playedAt: number
}

export interface ColorPalette {
  vibrant: string
  muted: string
  dark: string
  light: string
}

export type RepeatMode = 'off' | 'all' | 'one'

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

export interface EQPreset {
  name: string
  bands: number[]
}

export interface ImportProgress {
  total: number
  completed: number
  failed: number
  currentFile?: string
  errors: { file: string; error: string }[]
}

export interface LibraryStats {
  trackCount: number
  albumCount: number
  artistCount: number
  playlistCount: number
  totalDuration: number
}
