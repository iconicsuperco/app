import * as Dialog from '@radix-ui/react-dialog'
import { ListMusic, Plus } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { allPlaylistsQuery, createPlaylist } from '@/library/queries'
import type { Playlist } from '@/types'

export function PlaylistsPage() {
  const playlists = useLiveQuery(() => allPlaylistsQuery(), [])
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()

  const handleCreate = async (name: string) => {
    const id = await createPlaylist(name)
    setCreateOpen(false)
    navigate(`/playlist/${encodeURIComponent(id)}`)
  }

  if (playlists === undefined) return <PlaylistsLoading />

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Playlists</h1>
          <p className="text-muse-text-muted mt-0.5 text-sm">
            {playlists.length} playlist{playlists.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setCreateOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Playlist
        </Button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ListMusic className="text-muse-text-muted mb-4 h-12 w-12" />
          <h2 className="text-muse-text mb-2 text-lg font-semibold">No playlists yet</h2>
          <p className="text-muse-text-secondary text-sm">
            Create a playlist to organize your music
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      <CreatePlaylistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />
    </div>
  )
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const navigate = useNavigate()

  return (
    <Card
      variant="glass"
      className="hover:bg-muse-bg-hover cursor-pointer p-4 transition-colors duration-150"
      onClick={() => navigate(`/playlist/${encodeURIComponent(playlist.id)}`)}
    >
      <div className="flex items-center gap-3">
        <div className="bg-muse-accent-subtle text-muse-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
          <ListMusic className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muse-text truncate text-sm font-medium">{playlist.name}</p>
          <p className="text-muse-text-muted mt-0.5 text-xs">
            {playlist.trackIds.length} song{playlist.trackIds.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </Card>
  )
}

function CreatePlaylistDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => Promise<void>
}) {
  const [name, setName] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    void onCreate(trimmedName)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="border-muse-glass-border bg-muse-bg-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-xl">
          <form onSubmit={handleSubmit}>
            <Dialog.Title className="text-muse-text text-lg font-semibold">
              New playlist
            </Dialog.Title>
            <Dialog.Description className="text-muse-text-muted mt-2 text-sm">
              Give your playlist a name. You can add tracks from any song’s context menu.
            </Dialog.Description>
            <label
              className="text-muse-text mt-5 block text-sm font-medium"
              htmlFor="playlist-name"
            >
              Playlist name
            </label>
            <input
              id="playlist-name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border-muse-glass-border bg-muse-bg-hover text-muse-text focus:ring-muse-accent mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={!name.trim()}>
                Create playlist
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PlaylistsLoading() {
  return (
    <div className="p-6">
      <div className="bg-muse-bg-surface skeleton mb-6 h-7 w-28 rounded" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-muse-bg-surface skeleton h-[80px] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
