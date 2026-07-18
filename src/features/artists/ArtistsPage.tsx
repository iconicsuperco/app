import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { allArtistsQuery } from '@/library/queries'

import { Card } from '@/components/ui/Card'
import type { Artist } from '@/types'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Music2 } from 'lucide-react'

function ArtistCard({ artist }: { artist: Artist }) {
  const navigate = useNavigate()

  // Artists don't have an artworkId in the type; keep a consistent placeholder.
  // (Artwork for artist can be derived later if schema supports it.)
  return (
    <Card
      variant="glass"
      className="p-4 cursor-pointer hover:bg-muse-bg-hover transition-colors duration-150"
      onClick={() => navigate(`/artist/${encodeURIComponent(artist.id)}`)}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-muse-bg-surface shrink-0 overflow-hidden flex items-center justify-center">
          <User className="w-5 h-5 text-muse-text-muted" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate text-muse-text">{artist.name}</div>
          <div className="text-xs text-muse-text-muted mt-0.5 truncate">{artist.albumIds.length} albums</div>
        </div>
      </div>
    </Card>
  )
}
export function ArtistsPage() {
  const navigate = useNavigate()
  const artists = useLiveQuery(() => allArtistsQuery(), [])

  if (!artists) return <ArtistsLoading />
  if (artists.length === 0) return <ArtistsEmpty onAdd={() => navigate('/import')} />

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Artists</h1>
          <p className="text-sm text-muse-text-muted mt-0.5">
            {artists.length} artist{artists.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  )
}

function ArtistsLoading() {
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

function ArtistsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Artists</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <User className="w-12 h-12 text-muse-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-muse-text mb-2">No artists yet</h2>
        <p className="text-muse-text-secondary text-sm">Artists will appear as you add music</p>
        <Button variant="primary" size="md" onClick={onAdd} className="gap-2 mt-6">
          <Music2 className="w-4 h-4" />
          Add Music
        </Button>
      </div>
    </div>
  )
}
