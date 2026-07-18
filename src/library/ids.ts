/** Stable identifiers used to relate tracks, albums, and artists. */
export function makeAlbumId(title: string, artist: string): string {
  return slug(`album:${title}:${artist}`)
}

export function makeArtistId(name: string): string {
  return slug(`artist:${name}`)
}

/** Convert a string to a stable URL-safe slug. */
function slug(str: string): string {
  return str.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}
