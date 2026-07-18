import { cn, formatDuration } from '@/lib/utils'
import { usePlayerStore } from '@/player/PlayerStore'
import { playerController } from '@/audio/PlayerController'
import { useCurrentTrack } from '@/hooks/useCurrentTrack'
import { useArtwork } from '@/hooks/useArtwork'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Heart,
  ListMusic,
} from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { useUIStore } from '@/store/uiStore'
import { toggleFavorite } from '@/library/queries'

export function MiniPlayer() {
  const {
    status,
    position,
    duration,
    volume,
    muted,
    repeatMode,
    shuffle,
    setPosition,
    setVolume,
    toggleMute,
    cycleRepeatMode,
    toggleShuffle,
  } = usePlayerStore()

  const track = useCurrentTrack()
  const artworkUrl = useArtwork(track?.artworkId)
  const { setNowPlayingOpen, toggleQueue } = useUIStore()

  const isPlaying = status === 'playing'
  const hasTrack = track != null

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  const handleSeek = (value: number[]) => {
    setPosition(value[0] ?? 0)
    playerController.seek(value[0] ?? 0)
  }

  const handleFavorite = () => {
    if (track) void toggleFavorite(track.id)
  }

  return (
    <div
      className={cn(
        'glass border-t border-muse-glass-border shrink-0 z-30 relative',
        'transition-all duration-300',
        !hasTrack && 'opacity-60',
      )}
      style={{ height: 'var(--player-height)' }}
    >
      {/* Progress bar (absolute, top edge) */}
      <div className="absolute top-0 left-0 right-0 h-1 group cursor-pointer">
        <Slider
          value={[position]}
          onValueChange={handleSeek}
          min={0}
          max={duration || 100}
          step={0.1}
          className="absolute inset-0"
        />
      </div>

      <div className="flex items-center h-full px-4 gap-4">
        {/* Left: track info */}
        <div className="flex items-center gap-3 w-[280px] min-w-0 shrink-0">
          <div className="w-12 h-12 rounded-md bg-muse-bg-surface shrink-0 overflow-hidden">
            {artworkUrl ? (
              <img src={artworkUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muse-text truncate">
              {track?.title ?? 'No track playing'}
            </p>
            <p className="text-xs text-muse-text-muted truncate">
              {track?.artist ?? '—'}
            </p>
          </div>
          {track && (
            <Tooltip content={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleFavorite}
                className={cn(
                  'text-muse-text-muted hover:text-muse-accent shrink-0',
                  track.isFavorite && 'text-muse-accent',
                )}
              >
                <Heart className={cn('w-4 h-4', track.isFavorite && 'fill-current')} />
              </Button>
            </Tooltip>
          )}
        </div>

        {/* Center: transport controls */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <Tooltip content="Shuffle">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleShuffle}
                className={cn(
                  'text-muse-text-muted hover:text-muse-text',
                  shuffle && 'text-muse-accent',
                )}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Previous">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => playerController.previous()}
                disabled={!hasTrack}
                className="text-muse-text hover:text-muse-text"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </Button>
            </Tooltip>

            <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
              <Button
                variant="primary"
                size="icon-lg"
                onClick={() => playerController.togglePlayPause()}
                disabled={!hasTrack}
                className="rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </Button>
            </Tooltip>

            <Tooltip content="Next">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => playerController.next()}
                disabled={!hasTrack}
                className="text-muse-text hover:text-muse-text"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </Button>
            </Tooltip>

            <Tooltip content={`Repeat: ${repeatMode}`}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={cycleRepeatMode}
                className={cn(
                  'text-muse-text-muted hover:text-muse-text',
                  repeatMode !== 'off' && 'text-muse-accent',
                )}
              >
                <RepeatIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>

          {/* Time display */}
          <div className="flex items-center gap-2 text-[11px] text-muse-text-muted tabular-nums">
            <span>{formatDuration(position)}</span>
            <span>/</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: volume + extras */}
        <div className="flex items-center gap-2 w-[280px] justify-end shrink-0">
          <Tooltip content="Queue">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleQueue}
              aria-label="Open queue"
              className="text-muse-text-muted hover:text-muse-text"
            >
              <ListMusic className="w-4 h-4" />
            </Button>
          </Tooltip>

          <div className="flex items-center gap-2 w-32">
            <Tooltip content={muted ? 'Unmute' : 'Mute'}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleMute}
                className="text-muse-text-muted hover:text-muse-text"
              >
                <VolumeIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Slider
              value={[muted ? 0 : volume]}
              onValueChange={(v) => setVolume(v[0] ?? 0)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          <Tooltip content="Now Playing">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setNowPlayingOpen(true)}
              aria-label="Open now playing"
              className="text-muse-text-muted hover:text-muse-text"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
