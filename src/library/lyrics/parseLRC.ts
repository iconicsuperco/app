export interface LyricLine {
  time: number
  text: string
}
export function parseLRC(lyrics: string): LyricLine[] {
  const lines: LyricLine[] = []
  for (const raw of lyrics.split(/\r?\n/))
    for (const tag of raw.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g))
      lines.push({
        time:
          Number(tag[1]) * 60 +
          Number(tag[2]) +
          (tag[3] ? Number(tag[3]) / 10 ** tag[3].length : 0),
        text: raw.replace(/\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\]/g, '').trim(),
      })
  return lines.sort((a, b) => a.time - b.time)
}
