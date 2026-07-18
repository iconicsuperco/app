import { FileUp } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { parseLRC } from '@/library/lyrics/parseLRC'
import type { Track } from '@/types'
export function LyricsView({
  track,
  position,
  onSeek,
  onImport,
}: {
  track?: Track
  position: number
  onSeek: (time: number) => void
  onImport: (file: File) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const lines = parseLRC(track?.lyrics ?? '')
  if (!track?.lyrics)
    return (
      <div className="text-muse-text-muted text-center text-sm">
        No lyrics available.
        <input
          ref={input}
          type="file"
          accept=".lrc,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImport(f)
          }}
        />
        <Button variant="secondary" size="sm" onClick={() => input.current?.click()}>
          <FileUp className="h-4 w-4" />
          Import .lrc
        </Button>
      </div>
    )
  if (!lines.length)
    return (
      <div className="text-muse-text max-h-64 overflow-y-auto text-center whitespace-pre-wrap">
        {track.lyrics}
      </div>
    )
  const active = lines.reduce((r, l, i) => (l.time <= position ? i : r), 0)
  return (
    <div className="max-h-64 space-y-2 overflow-y-auto text-center">
      {lines.map((line, i) => (
        <button
          key={`${line.time}-${i}`}
          onClick={() => onSeek(line.time)}
          className={
            i === active
              ? 'text-muse-accent w-full font-semibold'
              : 'text-muse-text-muted w-full'
          }
        >
          {line.text || '♪'}
        </button>
      ))}
    </div>
  )
}
