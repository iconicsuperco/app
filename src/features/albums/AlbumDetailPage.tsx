import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { albumByIdQuery } from '@/library/queries'
import { useArtwork } from '@/hooks/useArtwork'
import { playerController } from '@/audio/PlayerController'
import { useMemo } from 'react'
import { TrackList } from '@/components/track/TrackList'
import type { Track } from '@/types'
import { Music2, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const data = useLiveQuery(() => (id ? albumByIdQuery(id) : Promise.resolve(null)), [id])

  const tracks = data?.tracks ?? []

  const trackIds = useMemo(() => {
    return (data?.tracks ?? []).map((t) => t.id)
  }, [data])


  if (!data) return <AlbumDetailLoading />

  if (tracks.length === 0) {
    return <AlbumDetailEmpty onBack={() => navigate('/albums')} />
  }

  return (
    <div className="h-full min-h-0 flex flex-col p-6">
      <div className="shrink-0 flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-20 h-20 rounded-xl bg-muse-bg-surface overflow-hidden shrink-0">
            <AlbumArtworkHero artworkId={data.album.artworkId} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{data.album.title}</h1>
            <p className="text-sm text-muse-text-muted mt-0.5">{(data.album as { artist?: string; artistName?: string }).artist ?? (data.album as { artist?: string; artistName?: string }).artistName ?? '—'}</p>


          </div>
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
        <TrackList
          tracks={tracks as Track[]}
          onPlayTrack={(trackId) => void playerController.playFromQueue(trackIds, trackId)}
        />
      </div>
    </div>
  )
}
function AlbumArtworkHero({ artworkId }: { artworkId?: string }) {
  const artworkUrl = useArtwork(artworkId)
  if (artworkUrl) {
    return <img src={artworkUrl} alt="" className="w-full h-full object-cover" />
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-muse-text-muted">
      <Music2 className="w-5 h-5" />
    </div>
  )
}

function AlbumDetailLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-20 w-full rounded-xl bg-muse-bg-surface skeleton" />
      <div className="h-7 w-40 rounded bg-muse-bg-surface skeleton" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 rounded bg-muse-bg-surface skeleton" />
      ))}
    </div>
  )
}

function AlbumDetailEmpty({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Album</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-muse-bg-surface flex items-center justify-center text-muse-text-muted mb-4">
          <Music2 className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-muse-text mb-2">No tracks found</h2>
        <p className="text-muse-text-secondary text-sm mb-6">This album has no tracks.</p>
        <Button variant="primary" size="md" onClick={onBack} className="gap-2">
          <Music2 className="w-4 h-4" />
          Back to Albums
        </Button>
      </div>
    </div>
  )
}
