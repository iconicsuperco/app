import { Heart, Music2, Play, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn, formatDuration } from '@/lib/utils'
import type { Track } from '@/types'
import { usePlayerStore } from '@/player/PlayerStore'
import { toggleFavorite } from '@/library/queries'
import { useArtwork } from '@/hooks/useArtwork'
import { TrackContextMenu } from '@/components/track/TrackContextMenu'

export function TrackRow({
  track,
  index,
  onPlay,
  onRemoveFromPlaylist,
}: {
  track: Track
  index: number
  onPlay: () => void
  onRemoveFromPlaylist?: (trackId: string) => void
}) {
  const currentTrackId = usePlayerStore((s) => s.currentTrackId)
  const isPlaying = usePlayerStore((s) => s.status === 'playing')
  const isActive = currentTrackId === track.id
  const artworkUrl = useArtwork(track.artworkId)
  const navigate = useNavigate()

  const handleDoubleClick = () => onPlay()

  return (
    <TrackContextMenu
      track={track}
      onGoToArtist={() => navigate(`/artist/${encodeURIComponent(track.artistId)}`)}
      onGoToAlbum={() => {
        if (track.albumId) navigate(`/album/${encodeURIComponent(track.albumId)}`)
      }}
    >
      <div
        onDoubleClick={handleDoubleClick}
        className={cn(
          'group grid cursor-pointer grid-cols-[2rem_4fr_3fr_1fr_5rem] items-center gap-3 rounded-md px-3 py-2',
          'transition-colors duration-100',
          isActive ? 'bg-muse-accent-subtle' : 'hover:bg-muse-bg-hover',
        )}
        onClick={onPlay}
      >
        {/* Index / playing indicator */}
        <div className="text-muse-text-muted flex items-center justify-center text-sm tabular-nums">
          {isActive && isPlaying ? (
            <PlayingBars />
          ) : (
            <>
              <span className="group-hover:hidden">{index + 1}</span>
              <Play className="text-muse-text hidden h-3.5 w-3.5 fill-current group-hover:block" />
            </>
          )}
        </div>

        {/* Title + artwork */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-muse-bg-surface h-10 w-10 shrink-0 overflow-hidden rounded">
            {artworkUrl ? (
              <img src={artworkUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music2 className="text-muse-text-muted h-4 w-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                'truncate text-sm font-medium',
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
              className="text-muse-text-muted hover:text-muse-text block truncate text-left text-xs hover:underline"
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
          className="text-muse-text-muted hover:text-muse-text truncate text-left text-sm hover:underline"
        >
          {track.album ?? '—'}
        </button>

        {/* Duration */}
        <span className="text-muse-text-muted text-right text-sm tabular-nums">
          {formatDuration(track.duration)}
        </span>

        <div className="flex items-center justify-end gap-2">
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
                ? 'text-muse-accent opacity-100'
                : 'text-muse-text-muted hover:text-muse-text opacity-0 group-hover:opacity-100',
            )}
          >
            <Heart className={cn('h-4 w-4', track.isFavorite && 'fill-current')} />
          </button>
          {onRemoveFromPlaylist && (
            <button
              onClick={(event) => {
                event.stopPropagation()
                onRemoveFromPlaylist(track.id)
              }}
              aria-label={`Remove ${track.title} from playlist`}
              className="text-muse-text-muted hover:text-muse-error flex items-center justify-center opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </TrackContextMenu>
  )
}

/** Animated equalizer bars shown next to the currently playing track. */
function PlayingBars() {
  return (
    <div className="flex h-3.5 items-end gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muse-accent w-0.5 rounded-full"
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
