import Dexie, { type Table } from 'dexie'
import type { Track, Album, Artist, Playlist, PlayHistoryEntry } from '@/types'
import { makeAlbumId, makeArtistId } from './ids'

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

    this.version(2)
      .stores({
        tracks: 'id, artistId, albumId, artist, album, albumArtist, genre, year, isFavorite, dateAdded, lastPlayed, duration',
        albums: 'id, title, albumArtist, year',
        artists: 'id, name',
        playlists: 'id, name, createdAt',
        playHistory: 'id, trackId, playedAt',
        audioBlobs: 'id',
        artworkBlobs: 'id',
      })
      .upgrade(async (tx) => {
        await tx.table('tracks').toCollection().modify((track: Track) => {
          track.artistId = makeArtistId(track.artist)
          track.albumId = track.album
            ? makeAlbumId(track.album, track.albumArtist ?? track.artist)
            : undefined
        })
      })

    this.version(3).stores({
      tracks: 'id, blobId, artistId, albumId, artist, album, albumArtist, genre, year, isFavorite, dateAdded, lastPlayed, duration',
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
