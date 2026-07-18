import type { Album, Artist, Track } from '@/types'
export function searchLibrary(
  query: string,
  tracks: Track[],
  albums: Album[],
  artists: Artist[],
) {
  const q = query.trim().toLowerCase()
  return {
    tracks: tracks.filter((t) =>
      `${t.title} ${t.artist} ${t.album ?? ''}`.toLowerCase().includes(q),
    ),
    albums: albums.filter((a) => a.title.toLowerCase().includes(q)),
    artists: artists.filter((a) => a.name.toLowerCase().includes(q)),
  }
}
