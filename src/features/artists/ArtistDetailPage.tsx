import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { artistByIdQuery } from '@/library/queries'
import { useMemo } from 'react'
import type { Album, Track } from '@/types'

import { useArtwork } from '@/hooks/useArtwork'

import { Card } from '@/components/ui/Card'
import { Music2 } from 'lucide-react'
import { Disc3 } from 'lucide-react'

import { playerController } from '@/audio/PlayerController'
import { TrackList } from '@/components/track/TrackList'


function AlbumCard({ album, onClick }: { album: Album; onClick: () => void }) {
  const artworkUrl = useArtwork(album.artworkId)
  return (
    <Card
      variant="glass"
      className="p-4 cursor-pointer hover:bg-muse-bg-hover transition-colors duration-150"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-muse-bg-surface shrink-0 overflow-hidden">
          {artworkUrl ? (
            <img src={artworkUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-muse-text-muted" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate text-muse-text">{album.title}</div>
          <div className="text-xs text-muse-text-muted mt-0.5 truncate">{album.year ?? ''}</div>
        </div>
      </div>
    </Card>
  )
}
export function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const data = useLiveQuery(() => (id ? artistByIdQuery(id) : Promise.resolve(null)), [id])

  const albums = (data as { albums?: Album[] } | null)?.albums ?? []

  const tracks = useMemo(() => {
    // artistByIdQuery currently only returns { artist, albums } (no top tracks).
    // Avoid extra DB queries here until the query provides top tracks.
    return [] as Track[]
  }, [])


  const trackIds = useMemo(() => tracks.map((t) => t.id), [tracks])

  if (!data) return <ArtistDetailLoading />

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{(data as { artist?: { name?: string } }).artist?.name ?? 'Artist'}</h1>

        <p className="text-sm text-muse-text-muted mt-0.5">
          {(albums?.length ?? 0)} album{(albums?.length ?? 0) === 1 ? '' : 's'}
        </p>
      </div>

      {albums.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-3">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {albums.map((album: Album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => navigate(`/album/${encodeURIComponent(album.id)}`)}
              />
            ))}
          </div>
        </>
      )}

      <h2 className="text-lg font-semibold mb-3">Top Tracks</h2>
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muse-text-muted">
          <Music2 className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-semibold text-muse-text mb-2">No tracks yet</h3>
          <p className="text-muse-text-secondary text-sm">Top tracks will appear once available.</p>
        </div>
      ) : (
        <div style={{ height: 'calc(100vh - 380px)' }}>
          <TrackList tracks={tracks} onPlayTrack={(trackId) => void playerController.playFromQueue(trackIds, trackId)} />
        </div>
      )}
    </div>
  )
}

function ArtistDetailLoading() {
  return (
    <div className="p-6">
      <div className="h-7 w-48 rounded bg-muse-bg-surface skeleton mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-muse-bg-surface skeleton h-[92px]" />
        ))}
      </div>
    </div>
  )
}
