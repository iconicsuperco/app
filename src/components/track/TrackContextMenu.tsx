import * as ContextMenu from '@radix-ui/react-context-menu'
import * as Dialog from '@radix-ui/react-dialog'
import { ChevronRight, ListMusic, ListPlus, Plus } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { addTrackToPlaylist, allPlaylistsQuery, createPlaylist } from '@/library/queries'
import { playerController } from '@/audio/PlayerController'
import { useUIStore } from '@/store/uiStore'
import type { Playlist, Track } from '@/types'

export function TrackContextMenu({
  track,
  children,
  onGoToArtist,
  onGoToAlbum,
}: {
  track: Track
  children: ReactNode
  onGoToArtist: () => void
  onGoToAlbum: () => void
}) {
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false)
  const [creatingPlaylist, setCreatingPlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const playlists = useLiveQuery(
    () => (playlistDialogOpen ? allPlaylistsQuery() : Promise.resolve<Playlist[]>([])),
    [playlistDialogOpen],
  )
  const addToast = useUIStore((state) => state.addToast)

  const handleAddToPlaylist = async (playlistId: string) => {
    await addTrackToPlaylist(playlistId, track.id)
    setPlaylistDialogOpen(false)
    addToast(`Added “${track.title}” to playlist`, 'success')
  }

  const handleCreatePlaylist = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newPlaylistName.trim()
    if (!name) return

    const playlistId = await createPlaylist(name)
    await addTrackToPlaylist(playlistId, track.id)
    setNewPlaylistName('')
    setCreatingPlaylist(false)
    setPlaylistDialogOpen(false)
    addToast(`Created “${name}” and added the track`, 'success')
  }

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="border-muse-glass-border bg-muse-bg-surface z-50 min-w-52 overflow-hidden rounded-lg border p-1 shadow-xl">
            <ContextMenu.Item
              className={menuItemClassName}
              onSelect={() => setPlaylistDialogOpen(true)}
            >
              <ListMusic className="h-4 w-4" />
              Add to playlist
            </ContextMenu.Item>
            <ContextMenu.Item
              className={menuItemClassName}
              onSelect={() => playerController.addToQueue(track.id)}
            >
              <ListPlus className="h-4 w-4" />
              Add to queue
            </ContextMenu.Item>
            <ContextMenu.Separator className="bg-muse-glass-border my-1 h-px" />
            <ContextMenu.Item className={menuItemClassName} onSelect={onGoToArtist}>
              Go to artist
              <ChevronRight className="ml-auto h-4 w-4" />
            </ContextMenu.Item>
            <ContextMenu.Item
              className={menuItemClassName}
              disabled={!track.albumId}
              onSelect={onGoToAlbum}
            >
              Go to album
              <ChevronRight className="ml-auto h-4 w-4" />
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      <Dialog.Root open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Content className="border-muse-glass-border bg-muse-bg-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-xl">
            {creatingPlaylist ? (
              <form onSubmit={(event) => void handleCreatePlaylist(event)}>
                <Dialog.Title className="text-muse-text text-lg font-semibold">
                  Create playlist
                </Dialog.Title>
                <Dialog.Description className="text-muse-text-muted mt-2 text-sm">
                  Create a playlist and add “{track.title}” to it.
                </Dialog.Description>
                <label
                  className="text-muse-text mt-5 block text-sm font-medium"
                  htmlFor="new-playlist-name"
                >
                  Playlist name
                </label>
                <input
                  id="new-playlist-name"
                  autoFocus
                  value={newPlaylistName}
                  onChange={(event) => setNewPlaylistName(event.target.value)}
                  className="border-muse-glass-border bg-muse-bg-hover text-muse-text focus:ring-muse-accent mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
                />
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setCreatingPlaylist(false)}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="sm" disabled={!newPlaylistName.trim()}>
                    Create playlist
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <Dialog.Title className="text-muse-text text-lg font-semibold">
                  Add to playlist
                </Dialog.Title>
                <Dialog.Description className="text-muse-text-muted mt-2 text-sm">
                  Choose a playlist for “{track.title}”.
                </Dialog.Description>
                <div className="mt-5 max-h-60 space-y-1 overflow-y-auto">
                  {playlists === undefined ? (
                    <p className="text-muse-text-muted py-3 text-sm">
                      Loading playlists…
                    </p>
                  ) : playlists.length === 0 ? (
                    <p className="text-muse-text-muted py-3 text-sm">
                      No playlists yet. Create your first one below.
                    </p>
                  ) : (
                    playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        type="button"
                        onClick={() => void handleAddToPlaylist(playlist.id)}
                        className="text-muse-text hover:bg-muse-bg-hover flex w-full items-center rounded-md px-3 py-2 text-left text-sm"
                      >
                        <ListMusic className="text-muse-text-muted mr-2 h-4 w-4" />
                        <span className="truncate">{playlist.name}</span>
                      </button>
                    ))
                  )}
                </div>
                <div className="mt-6 flex justify-between gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCreatingPlaylist(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New playlist…
                  </Button>
                  <Dialog.Close asChild>
                    <Button variant="secondary" size="sm">
                      Cancel
                    </Button>
                  </Dialog.Close>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

const menuItemClassName =
  'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-muse-text outline-none data-[highlighted]:bg-muse-bg-hover data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
