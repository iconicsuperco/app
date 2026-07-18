import { Music2, Play, Clock } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { recentlyAddedTracksQuery, libraryStatsQuery } from '@/library/queries'
import { playerController } from '@/audio/PlayerController'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useArtwork } from '@/hooks/useArtwork'
import { formatDuration } from '@/lib/utils'
import type { Track } from '@/types'

export function HomePage() {
  const navigate = useNavigate()
  const recentTracks = useLiveQuery(() => recentlyAddedTracksQuery(12), [])
  const stats = useLiveQuery(() => libraryStatsQuery(), [])

  const isEmpty = recentTracks && recentTracks.length === 0 && stats?.trackCount === 0

  return (
    <div className="p-6 space-y-8">
      {/* Hero */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muse-text-muted mb-1">Welcome back to</p>
          <h1 className="text-4xl font-display font-bold tracking-tight gradient-text">Muse</h1>
          {stats && stats.trackCount > 0 && (
            <p className="text-muse-text-secondary mt-2">
              {stats.trackCount} song{stats.trackCount === 1 ? '' : 's'} ·{' '}
              {stats.albumCount} album{stats.albumCount === 1 ? '' : 's'} ·{' '}
              {stats.artistCount} artist{stats.artistCount === 1 ? '' : 's'} ·{' '}
              {formatDuration(stats.totalDuration)} total
            </p>
          )}
        </div>
        <Button variant="primary" size="lg" onClick={() => navigate('/import')} className="gap-2 shrink-0">
          <Music2 className="w-4 h-4" />
          Add Music
        </Button>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20 flex items-center justify-center mb-6">
            <Music2 className="w-10 h-10 text-muse-accent" />
          </div>
          <h2 className="text-xl font-semibold text-muse-text mb-2">Start your library</h2>
          <p className="text-muse-text-secondary max-w-md mb-6">
            Drag and drop audio files, or browse your computer to import songs. Everything
            stays local — no accounts, no streaming.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/import')} className="gap-2">
            <Music2 className="w-4 h-4" />
            Add Music
          </Button>
        </div>
      )}

      {/* Recently added shelf */}
      {recentTracks && recentTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-muse-accent" />
              Recently Added
            </h2>
            <button
              onClick={() => navigate('/recently-added')}
              className="text-xs text-muse-text-muted hover:text-muse-text uppercase tracking-wider"
            >
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentTracks.map((track) => (
              <RecentTrackCard
                key={track.id}
                track={track}
                onPlay={() =>
                  void playerController.playFromQueue(
                    recentTracks.map((t) => t.id),
                    track.id,
                  )
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function RecentTrackCard({ track, onPlay }: { track: Track; onPlay: () => void }) {
  const artworkUrl = useArtwork(track.artworkId)
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer"
      onClick={onPlay}
      onDoubleClick={onPlay}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muse-bg-surface mb-2">
        {artworkUrl ? (
          <img src={artworkUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
            <Music2 className="w-8 h-8 text-muse-text-muted" />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPlay()
          }}
          className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-muse-accent text-white flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105"
          aria-label="Play"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>
      <p className="text-sm font-medium text-muse-text truncate">{track.title}</p>
      <button
        onClick={(e) => {
          e.stopPropagation()
          navigate(`/artist/${encodeURIComponent(track.artist)}`)
        }}
        className="text-xs text-muse-text-muted hover:text-muse-text hover:underline truncate block text-left w-full"
      >
        {track.artist}
      </button>
    </div>
  )
}
