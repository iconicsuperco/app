import { Heart, Music2, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn, formatDuration } from '@/lib/utils'
import type { Track } from '@/types'
import { usePlayerStore } from '@/player/PlayerStore'
import { toggleFavorite } from '@/library/queries'
import { useArtwork } from '@/hooks/useArtwork'

export function TrackRow({
  track,
  index,
  onPlay,
}: {
  track: Track
  index: number
  onPlay: () => void
}) {
  const currentTrackId = usePlayerStore((s) => s.currentTrackId)
  const isPlaying = usePlayerStore((s) => s.status === 'playing')
  const isActive = currentTrackId === track.id
  const artworkUrl = useArtwork(track.artworkId)
  const navigate = useNavigate()

  const handleDoubleClick = () => onPlay()

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        'group grid grid-cols-[2rem_4fr_3fr_1fr_3fr_1fr_3rem] gap-3 items-center px-3 py-2 rounded-md cursor-pointer',
        'transition-colors duration-100',
        isActive ? 'bg-muse-accent-subtle' : 'hover:bg-muse-bg-hover',
      )}
      onClick={onPlay}
    >
      {/* Index / playing indicator */}
      <div className="flex items-center justify-center text-sm text-muse-text-muted tabular-nums">
        {isActive && isPlaying ? (
          <PlayingBars />
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block text-muse-text" />
          </>
        )}
      </div>

      {/* Title + artwork */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-muse-bg-surface">
          {artworkUrl ? (
            <img src={artworkUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-4 h-4 text-muse-text-muted" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-muse-accent' : 'text-muse-text',
            )}
          >
            {track.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/artist/${encodeURIComponent(track.artistId)}`)
            }}
            className="text-xs text-muse-text-muted hover:text-muse-text hover:underline truncate block text-left"
          >
            {track.artist}
          </button>
        </div>
      </div>

      {/* Album */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (track.albumId) navigate(`/album/${encodeURIComponent(track.albumId)}`)
        }}
        className="text-sm text-muse-text-muted hover:text-muse-text hover:underline truncate text-left"
      >
        {track.album ?? '—'}
      </button>

      {/* Duration */}
      <span className="text-sm text-muse-text-muted text-right tabular-nums">
        {formatDuration(track.duration)}
      </span>

      {/* Favorite */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          void toggleFavorite(track.id)
        }}
        aria-label={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        className={cn(
          'flex items-center justify-center transition-opacity',
          track.isFavorite
            ? 'opacity-100 text-muse-accent'
            : 'opacity-0 group-hover:opacity-100 text-muse-text-muted hover:text-muse-text',
        )}
      >
        <Heart className={cn('w-4 h-4', track.isFavorite && 'fill-current')} />
      </button>
    </div>
  )
}

/** Animated equalizer bars shown next to the currently playing track. */
function PlayingBars() {
  return (
    <div className="flex items-end gap-0.5 h-3.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-0.5 bg-muse-accent rounded-full"
          style={{
            animation: `eq-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes eq-bar {
          0% { height: 30%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  )
}
