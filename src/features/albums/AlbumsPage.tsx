import { Disc3 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { allAlbumsQuery } from '@/library/queries'
import { useArtwork } from '@/hooks/useArtwork'
import { Card } from '@/components/ui/Card'
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import type { Album } from '@/types'
import { Music2 } from 'lucide-react'

function AlbumCard({ album }: { album: Album }) {
  const navigate = useNavigate()
  const artworkUrl = useArtwork(album.artworkId)

  return (
    <Card
      variant="glass"
      className="p-4 cursor-pointer hover:bg-muse-bg-hover transition-colors duration-150"
      onClick={() => navigate(`/album/${encodeURIComponent(album.id)}`)}
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
          <div className="text-xs text-muse-text-muted mt-0.5 truncate">{(album as { artist?: string; artistName?: string }).artist ?? (album as { artist?: string; artistName?: string }).artistName ?? '—'}</div>


        </div>
      </div>
    </Card>
  )
}

export function AlbumsPage() {
  const navigate = useNavigate()
  const albums = useLiveQuery(() => allAlbumsQuery(), [])

  const count = albums?.length ?? 0
  const safeAlbums = useMemo(() => albums ?? [], [albums])

  if (!albums) {
    return <AlbumsLoading />
  }

  if (albums.length === 0) {
    return <AlbumsEmpty onAdd={() => navigate('/import')} />
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Albums</h1>
          <p className="text-sm text-muse-text-muted mt-0.5">
            {count} album{count === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {safeAlbums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  )
}

function AlbumsLoading() {
  return (
    <div className="p-6">
      <div className="h-7 w-28 rounded bg-muse-bg-surface skeleton mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-muse-bg-surface skeleton h-[92px]" />
        ))}
      </div>
    </div>
  )
}

function AlbumsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Albums</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Disc3 className="w-12 h-12 text-muse-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-muse-text mb-2">No albums yet</h2>
        <p className="text-muse-text-secondary text-sm">Albums will appear as you add music</p>
        <Button variant="primary" size="md" onClick={onAdd} className="gap-2 mt-6">
          <Music2 className="w-4 h-4" />
          Add Music
        </Button>
      </div>
    </div>
  )
}
