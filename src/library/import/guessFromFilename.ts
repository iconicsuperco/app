export interface GuessedMetadata {
  title?: string
  artist?: string
  /** Track number parsed from leading "01." or "01-" prefixes. */
  trackNo?: number
}

/**
 * Heuristically derive { title, artist, trackNo } from a filename when
 * proper metadata tags are missing.
 *
 * Recognized patterns (in priority order):
 *
 *   "Artist - Title"            → { artist, title }
 *   "01. Artist - Title"        → { trackNo, artist, title }
 *   "01. Title"                 → { trackNo, title }
 *   "01 - Title"                → { trackNo, title }
 *   "01 - Artist - Title"       → { trackNo, artist, title }
 *   "Title"                     → { title }
 *
 * File extension is always stripped. Underscores become spaces, excess
 * whitespace is collapsed.
 */
export function guessFromFilename(filename: string): GuessedMetadata {
  // Strip extension
  const extMatch = filename.match(/\.[a-z0-9]+$/i)
  const base = (extMatch ? filename.slice(0, extMatch.index) : filename).trim()

  // Normalize underscores → spaces, collapse whitespace
  const cleaned = base.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cleaned) return {}

  // Match leading track number: "01.", "01)", "01 -", "01–"
  const trackMatch = cleaned.match(/^(\d{1,3})\s*[.)\-.]\s+/)
  let trackNo: number | undefined
  let rest = cleaned
  if (trackMatch) {
    trackNo = parseInt(trackMatch[1]!, 10)
    rest = cleaned.slice(trackMatch[0].length)
  }

  // Split on " - " (or " – " en-dash) to find artist/title
  // Only treat the FIRST separator as artist/title boundary
  const parts = rest.split(/\s+[–—-]\s+/).map((p) => p.trim()).filter(Boolean)

  if (parts.length >= 3) {
    // "Artist - Album - Title" or "Artist - Title - Something"
    // Safest interpretation: first is artist, last is title
    return {
      artist: titleCase(parts[0]),
      title: titleCase(parts[parts.length - 1]!),
      trackNo,
    }
  }

  if (parts.length === 2) {
    return {
      artist: titleCase(parts[0]),
      title: titleCase(parts[1]!),
      trackNo,
    }
  }

  // Single segment — treat whole thing as title
  return {
    title: titleCase(parts[0] ?? rest),
    trackNo,
  }
}

/** Minimal title-case: capitalize first letter of each word. */
function titleCase(str: string | undefined): string | undefined {
  if (!str) return undefined
  return str.replace(/\b\w/g, (c) => c.toUpperCase())
}
