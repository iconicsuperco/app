import { Heart, Maximize2, Music2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { playerController } from '@/audio/PlayerController'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { useArtwork } from '@/hooks/useArtwork'
import { useCurrentTrack } from '@/hooks/useCurrentTrack'
import { toggleFavorite } from '@/library/queries'
import { cn, formatDuration } from '@/lib/utils'
import { usePlayerStore } from '@/player/PlayerStore'
import { useUIStore } from '@/store/uiStore'

export function NowPlayingView() {
  const track = useCurrentTrack()
  const artworkUrl = useArtwork(track?.artworkId)
  const navigate = useNavigate()
  const setNowPlayingOpen = useUIStore((s) => s.setNowPlayingOpen)
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

  const isPlaying = status === 'playing'
  const hasTrack = track != null
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const palette = track?.palette

  const handleSeek = (value: number[]) => {
    const time = value[0] ?? 0
    setPosition(time)
    playerController.seek(time)
  }

  const navigateTo = (path: string) => {
    setNowPlayingOpen(false)
    navigate(path)
  }

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-y-auto bg-muse-bg px-6 py-5 sm:px-10"
      style={palette ? {
        backgroundImage: `radial-gradient(circle at 50% 25%, ${palette.vibrant}45 0%, ${palette.dark}30 35%, transparent 70%)`,
      } : undefined}
    >
      <div className="absolute inset-0 bg-muse-bg/70 pointer-events-none" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 min-h-0 flex-col">
        <div className="flex shrink-0 justify-end">
          <Button variant="ghost" size="icon" aria-label="Close now playing" onClick={() => setNowPlayingOpen(false)}>
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-1 min-h-0 flex-col items-center justify-center gap-8 py-4 lg:flex-row lg:gap-14">
          <div className="aspect-square w-full max-w-[min(65vw,28rem)] shrink-0 overflow-hidden rounded-2xl bg-muse-bg-surface shadow-2xl shadow-black/40">
            {artworkUrl ? (
              <img src={artworkUrl} alt={`Artwork for ${track?.album ?? track?.title ?? 'current track'}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muse-accent/30 to-muse-bg-hover">
                <Music2 className="w-20 h-20 text-muse-text-muted" />
              </div>
            )}
          </div>

          <div className="w-full max-w-xl space-y-6">
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-bold text-muse-text sm:text-4xl">{track?.title ?? 'No track playing'}</h1>
              {track ? (
                <div className="mt-2 flex flex-wrap items-center gap-x-2 text-base text-muse-text-muted sm:text-lg">
                  <button type="button" className="hover:text-muse-text hover:underline" onClick={() => navigateTo(`/artist/${encodeURIComponent(track.artistId)}`)}>
                    {track.artist}
                  </button>
                  <span aria-hidden="true">•</span>
                  {track.albumId ? (
                    <button type="button" className="hover:text-muse-text hover:underline" onClick={() => {
                      if (track.albumId) navigateTo(`/album/${encodeURIComponent(track.albumId)}`)
                    }}>
                      {track.album ?? 'Unknown Album'}
                    </button>
                  ) : (
                    <span>{track.album ?? 'Unknown Album'}</span>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-muse-text-muted">Choose a track to start listening</p>
              )}
            </div>

            <div className="space-y-2">
              <Slider value={[position]} onValueChange={handleSeek} min={0} max={duration || 100} step={0.1} disabled={!hasTrack} />
              <div className="flex justify-between text-xs tabular-nums text-muse-text-muted">
                <span>{formatDuration(position)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" aria-label="Toggle shuffle" onClick={toggleShuffle} className={cn(shuffle && 'text-muse-accent')}>
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon-lg" aria-label="Previous track" onClick={() => void playerController.previous()} disabled={!hasTrack}>
                <SkipBack className="w-6 h-6 fill-current" />
              </Button>
              <Button variant="primary" size="icon-lg" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={() => void playerController.togglePlayPause()} disabled={!hasTrack} className="h-14 w-14 rounded-full">
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon-lg" aria-label="Next track" onClick={() => void playerController.next()} disabled={!hasTrack}>
                <SkipForward className="w-6 h-6 fill-current" />
              </Button>
              <Button variant="ghost" size="icon" aria-label={`Repeat: ${repeatMode}`} onClick={cycleRepeatMode} className={cn(repeatMode !== 'off' && 'text-muse-accent')}>
                <RepeatIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon-sm" aria-label={muted ? 'Unmute' : 'Mute'} onClick={toggleMute}>
                <VolumeIcon className="w-4 h-4" />
              </Button>
              <Slider value={[muted ? 0 : volume]} onValueChange={(value) => setVolume(value[0] ?? 0)} min={0} max={1} step={0.01} />
              {track && (
                <Button variant="ghost" size="icon-sm" aria-label={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'} onClick={() => void toggleFavorite(track.id)} className={cn(track.isFavorite && 'text-muse-accent')}>
                  <Heart className={cn('w-5 h-5', track.isFavorite && 'fill-current')} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
