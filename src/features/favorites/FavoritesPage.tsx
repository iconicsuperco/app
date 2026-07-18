import { Heart, Music2, Play } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { favoriteTracksQuery } from '@/library/queries'
import { playerController } from '@/audio/PlayerController'
import { Button } from '@/components/ui/Button'
import { TrackList } from '@/components/track/TrackList'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export function FavoritesPage() {
  const favorites = useLiveQuery(() => favoriteTracksQuery(), [])

  const allTrackIds = useMemo(() => favorites?.map((t) => t.id) ?? [], [favorites])

  if (!favorites) {
    return <FavoritesLoading />
  }

  if (favorites.length === 0) {
    return <FavoritesEmpty />
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-sm text-muse-text-muted mt-0.5">
            {favorites.length} song{favorites.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            void playerController.playFromQueue(allTrackIds, favorites[0]?.id)
          }}
          className="gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          Play All
        </Button>
      </div>

      <div className="grid grid-cols-[2rem_4fr_3fr_1fr_3rem] gap-3 px-3 pb-2 text-xs text-muse-text-muted uppercase tracking-wider border-b border-muse-glass-border">
        <span className="text-center">#</span>
        <span>Title</span>
        <span>Album</span>
        <span className="text-right">Time</span>
        <span />
      </div>

      <div className="pt-1" style={{ height: 'calc(100vh - 260px)' }}>
        <TrackList
          tracks={favorites}
          onPlayTrack={(trackId) => {
            void playerController.playFromQueue(allTrackIds, trackId)
          }}
        />
      </div>
    </div>
  )
}

function FavoritesLoading() {
  return (
    <div className="p-6 space-y-2">
      <div className="h-7 w-32 rounded bg-muse-bg-surface skeleton" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 rounded bg-muse-bg-surface skeleton" />
      ))}
    </div>
  )
}

function FavoritesEmpty() {
  const navigate = useNavigate()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="w-12 h-12 text-muse-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-muse-text mb-2">No favorites yet</h2>
        <p className="text-muse-text-secondary text-sm mb-6">Heart songs to save them here</p>
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
