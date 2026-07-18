import { ListMusic, Music2, X } from 'lucide-react'
import { Reorder } from 'framer-motion'
import { playerController } from '@/audio/PlayerController'
import { Button } from '@/components/ui/Button'
import { useArtwork } from '@/hooks/useArtwork'
import { useCurrentTrack } from '@/hooks/useCurrentTrack'
import { useQueueTracks } from '@/hooks/useQueueTracks'
import { cn, formatDuration } from '@/lib/utils'
import { useQueueStore } from '@/player/QueueStore'
import { useUIStore } from '@/store/uiStore'
import type { Track } from '@/types'

interface QueueItem {
  id: string
  queueIndex: number
  key: string
  track: Track
}

export function QueuePanel() {
  const queue = useQueueStore((s) => s.queue)
  const currentIndex = useQueueStore((s) => s.currentIndex)
  const reorderQueue = useQueueStore((s) => s.reorderQueue)
  const setQueueOpen = useUIStore((s) => s.setQueueOpen)
  const currentTrack = useCurrentTrack()

  const queueTracks = useQueueTracks(queue)
  const queueItems = queue.flatMap((id, index) => {
    const track = queueTracks[index]
    return track ? [{ id, queueIndex: index, key: `${id}-${index}`, track }] : []
  })

  const upNext = queueItems.filter((item) => item.queueIndex > currentIndex)

  const handleReorder = (reordered: QueueItem[]) => {
    const workingItems = [...upNext]
    for (const [offset, item] of reordered.entries()) {
      const fromOffset = workingItems.findIndex((entry) => entry.key === item.key)
      if (fromOffset < 0 || fromOffset === offset) continue
      reorderQueue(currentIndex + 1 + fromOffset, currentIndex + 1 + offset)
      const [moved] = workingItems.splice(fromOffset, 1)
      if (moved) workingItems.splice(offset, 0, moved)
    }
  }

  const jumpToTrack = (trackId: string) => {
    void playerController.playFromQueue(queue, trackId)
  }

  return (
    <aside className="flex h-full flex-col bg-muse-bg-elevated p-4 shadow-2xl shadow-black/30" aria-label="Queue">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-muse-accent" />
          <h2 className="text-lg font-bold text-muse-text">Queue</h2>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close queue" onClick={() => setQueueOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-6 shrink-0">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muse-text-muted">Now Playing</h3>
        {currentTrack ? <QueueTrackRow track={currentTrack} active /> : <p className="text-sm text-muse-text-muted">Nothing playing</p>}
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muse-text-muted">Up Next</h3>
        {upNext.length === 0 ? (
          <p className="text-sm text-muse-text-muted">No more tracks in the queue</p>
        ) : (
          <Reorder.Group axis="y" values={upNext} onReorder={handleReorder} className="space-y-1">
            {upNext.map((item) => (
              <Reorder.Item key={item.key} value={item} className="cursor-grab active:cursor-grabbing">
                <QueueTrackRow track={item.track} onClick={() => jumpToTrack(item.id)} />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </aside>
  )
}

function QueueTrackRow({ track, active = false, onClick }: { track: Track; active?: boolean; onClick?: () => void }) {
  const artworkUrl = useArtwork(track.artworkId)

  return (
    <button type="button" onClick={onClick} className={cn('flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muse-bg-hover', active && 'bg-muse-accent-subtle')}>
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muse-bg-surface">
        {artworkUrl ? <img src={artworkUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Music2 className="w-4 h-4 text-muse-text-muted" /></div>}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', active ? 'text-muse-accent' : 'text-muse-text')}>{track.title}</p>
        <p className="truncate text-xs text-muse-text-muted">{track.artist}</p>
      </div>
      <span className="text-xs tabular-nums text-muse-text-muted">{formatDuration(track.duration)}</span>
    </button>
  )
}
