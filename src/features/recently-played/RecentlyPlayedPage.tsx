import { ListMusic, Music2, Play } from 'lucide-react'

import { useLiveQuery } from 'dexie-react-hooks'
import { recentlyPlayedQuery } from '@/library/queries'
import { playerController } from '@/audio/PlayerController'
import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { TrackList } from '@/components/track/TrackList'
import { useNavigate } from 'react-router-dom'
import type { Track } from '@/types'

export function RecentlyPlayedPage() {
  const entries = useLiveQuery(() => recentlyPlayedQuery(), [])

  const tracks = useMemo(() => entries?.map((e) => e.track) ?? [], [entries])
  const trackIds = useMemo(() => tracks.map((t) => t.id), [tracks])

  if (!entries) {
    return <RecentlyPlayedLoading />
  }

  if (tracks.length === 0) {
    return <RecentlyPlayedEmpty />
  }

  return (
    <div className="h-full min-h-0 flex flex-col p-6">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Recently Played</h1>
          <p className="text-sm text-muse-text-muted mt-0.5">
            {tracks.length} song{tracks.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => void playerController.playFromQueue(trackIds, tracks[0]?.id)}
          className="gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          Play All
        </Button>
      </div>

      <div className="shrink-0 grid grid-cols-[2rem_4fr_3fr_1fr_3rem] gap-3 px-3 pb-2 text-xs text-muse-text-muted uppercase tracking-wider border-b border-muse-glass-border">
        <span className="text-center">#</span>
        <span>Title</span>
        <span>Album</span>
        <span className="text-right">Time</span>
        <span />
      </div>

      <div className="flex-1 min-h-0 pt-1">
        <TrackList tracks={tracks as Track[]} onPlayTrack={(trackId) => void playerController.playFromQueue(trackIds, trackId)} />
      </div>
    </div>
  )
}

function RecentlyPlayedLoading() {
  return (
    <div className="p-6 space-y-2">
      <div className="h-7 w-32 rounded bg-muse-bg-surface skeleton" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 rounded bg-muse-bg-surface skeleton" />
      ))}
    </div>
  )
}

function RecentlyPlayedEmpty() {
  const navigate = useNavigate()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recently Played</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ListMusic className="w-12 h-12 text-muse-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-muse-text mb-2">No play history</h2>
        <p className="text-muse-text-secondary text-sm mb-6">Songs you listen to will appear here</p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/songs')}
          className="gap-2"
        >
          <Music2 className="w-4 h-4" />
          Browse Songs
        </Button>
      </div>
    </div>
  )
}
