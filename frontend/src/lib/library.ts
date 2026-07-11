export type TrackSummary = {
  id: string
  title: string
  artist: string
  album: string
  durationSeconds: number
  format: string
  relativePath: string
}

export type LibrarySnapshot = {
  libraryName: string
  trackCount: number
  totalDurationSeconds: number
  tracks: TrackSummary[]
}

const browserFallbackSnapshot: LibrarySnapshot = {
  libraryName: 'Muse Library',
  trackCount: 3,
  totalDurationSeconds: 681,
  tracks: [
    {
      id: 'track_001',
      title: 'Daydream Receiver',
      artist: 'Muse Local',
      album: 'Offline Summer',
      durationSeconds: 223,
      format: 'FLAC',
      relativePath: 'library/Muse Local/Offline Summer/01 Daydream Receiver.flac',
    },
    {
      id: 'track_002',
      title: 'Night Transit',
      artist: 'Aster Lane',
      album: 'City Signals',
      durationSeconds: 201,
      format: 'MP3',
      relativePath: 'library/Aster Lane/City Signals/02 Night Transit.mp3',
    },
    {
      id: 'track_003',
      title: 'Static Bloom',
      artist: 'North Arcade',
      album: 'Glass Rooms',
      durationSeconds: 257,
      format: 'AAC',
      relativePath: 'library/North Arcade/Glass Rooms/07 Static Bloom.m4a',
    },
  ],
}

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : ''

export async function getLibrarySnapshot(): Promise<LibrarySnapshot> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/library/snapshot`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch from API, using fallback:', error)
    return browserFallbackSnapshot
  }
}
