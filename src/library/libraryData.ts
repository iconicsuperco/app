import { db } from './db'

/** A portable, JSON-safe snapshot of the user's library metadata. */
export async function exportLibraryData() {
  const [tracks, albums, artists, playlists, playHistory] = await Promise.all([
    db.tracks.toArray(),
    db.albums.toArray(),
    db.artists.toArray(),
    db.playlists.toArray(),
    db.playHistory.toArray(),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tracks,
    albums,
    artists,
    playlists,
    playHistory,
  }
}

/** Remove all library records, including locally stored audio and artwork blobs. */
export async function clearLibraryData(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.tracks,
      db.albums,
      db.artists,
      db.playlists,
      db.playHistory,
      db.audioBlobs,
      db.artworkBlobs,
    ],
    async () => {
      await Promise.all([
        db.tracks.clear(),
        db.albums.clear(),
        db.artists.clear(),
        db.playlists.clear(),
        db.playHistory.clear(),
        db.audioBlobs.clear(),
        db.artworkBlobs.clear(),
      ])
    },
  )
}
