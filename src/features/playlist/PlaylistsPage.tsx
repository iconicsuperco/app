import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function PlaylistsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Playlists</h1>
        <Button variant="primary" size="md" className="gap-2">
          <Plus className="w-4 h-4" />
          New Playlist
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muse-text-muted text-sm">Create playlists to organize your music</p>
      </div>
    </div>
  )
}
