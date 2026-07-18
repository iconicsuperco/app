import Dexie, { type Table } from 'dexie'
import type { Track, Album, Artist, Playlist, PlayHistoryEntry } from '@/types'

export class MuseDB extends Dexie {
  tracks!: Table<Track, string>
  albums!: Table<Album, string>
  artists!: Table<Artist, string>
  playlists!: Table<Playlist, string>
  playHistory!: Table<PlayHistoryEntry, string>
  audioBlobs!: Table<{ id: string; blob: Blob }, string>
  artworkBlobs!: Table<{ id: string; blob: Blob }, string>

  constructor() {
    super('muse-db')

    this.version(1).stores({
      tracks: 'id, artist, album, albumArtist, genre, year, isFavorite, dateAdded, lastPlayed, duration',
      albums: 'id, title, albumArtist, year',
      artists: 'id, name',
      playlists: 'id, name, createdAt',
      playHistory: 'id, trackId, playedAt',
      audioBlobs: 'id',
      artworkBlobs: 'id',
    })
  }
}

export const db = new MuseDB()
