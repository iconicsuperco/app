import { Music2, Play } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { allTracksQuery } from '@/library/queries'
import { playerController } from '@/audio/PlayerController'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TrackRow } from '@/components/track/TrackRow'

export function SongsPage() {
  const tracks = useLiveQuery(() => allTracksQuery(), [])

  if (!tracks) {
    return <SongsLoading />
  }

  if (tracks.length === 0) {
    return <SongsEmpty />
  }

  const handlePlayAll = () => {
    void playerController.playFromQueue(
      tracks.map((t) => t.id),
      tracks[0]?.id,
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Songs</h1>
          <p className="text-muse-text-muted mt-0.5 text-sm">
            {tracks.length} song{tracks.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handlePlayAll} className="gap-2">
          <Play className="h-4 w-4 fill-current" />
          Play All
        </Button>
      </div>

      {/* Header row */}
      <div className="text-muse-text-muted border-muse-glass-border grid grid-cols-[2rem_4fr_3fr_1fr_3rem] gap-3 border-b px-3 pb-2 text-xs tracking-wider uppercase">
        <span className="text-center">#</span>
        <span>Title</span>
        <span>Album</span>
        <span className="text-right">Time</span>
        <span></span>
      </div>

      {/* Track rows */}
      <div className="pt-1">
        {tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            onPlay={() =>
              void playerController.playFromQueue(
                tracks.map((t) => t.id),
                track.id,
              )
            }
          />
        ))}
      </div>
    </div>
  )
}

function SongsLoading() {
  return (
    <div className="space-y-2 p-6">
      <div className="bg-muse-bg-surface skeleton h-7 w-32 rounded" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-muse-bg-surface skeleton h-14 rounded" />
      ))}
    </div>
  )
}

function SongsEmpty() {
  const navigate = useNavigate()
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Songs</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Music2 className="text-muse-text-muted mb-4 h-12 w-12" />
        <h2 className="text-muse-text mb-2 text-lg font-semibold">No songs yet</h2>
        <p className="text-muse-text-secondary mb-6 text-sm">
          Add music to see your songs here
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/import')}
          className="gap-2"
        >
          <Music2 className="h-4 w-4" />
          Add Music
        </Button>
      </div>
    </div>
  )
}
