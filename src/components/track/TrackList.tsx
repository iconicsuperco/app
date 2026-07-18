import type { ReactNode } from 'react'
import { useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ScrollArea } from '@/components/ui/ScrollArea'
import type { Track } from '@/types'
import { TrackRow } from '@/components/track/TrackRow'

export function TrackList({
  tracks,
  onPlayTrack,
  className,
  header,
  estimatedRowHeight = 56,
}: {
  tracks: Track[]
  onPlayTrack: (trackId: string) => void
  className?: string
  header?: ReactNode
  estimatedRowHeight?: number
}) {
  const parentRef = useRef<HTMLDivElement | null>(null)

  const virtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: tracks.length,
    estimateSize: () => estimatedRowHeight,
    overscan: 8,
  })

  const items = useMemo(() => virtualizer.getVirtualItems(), [virtualizer])

  return (
    <div className={className}>
      {header}
      <ScrollArea className="h-full">
        <div ref={parentRef} className="h-full w-full relative">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {items.map((virtualRow) => {
              const track = tracks[virtualRow.index]
              if (!track) return null

              return (
                <div
                  key={track.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TrackRow track={track} index={virtualRow.index} onPlay={() => onPlayTrack(track.id)} />
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

