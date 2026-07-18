import * as Dialog from '@radix-ui/react-dialog'
import { ListMusic, Music2, Pencil, Play, Trash2 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TrackList } from '@/components/track/TrackList'
import { playerController } from '@/audio/PlayerController'
import {
  deletePlaylist,
  playlistByIdQuery,
  removeTrackFromPlaylist,
  renamePlaylist,
} from '@/library/queries'

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const data = useLiveQuery(
    () => (id ? playlistByIdQuery(id) : Promise.resolve(null)),
    [id],
  )
  const trackIds = useMemo(() => data?.tracks.map((track) => track.id) ?? [], [data])

  if (data === undefined) return <PlaylistDetailLoading />
  if (data === null) return <PlaylistNotFound onBack={() => navigate('/playlists')} />

  const { playlist, tracks } = data

  const handleRename = async (name: string) => {
    await renamePlaylist(playlist.id, name)
    setRenameOpen(false)
  }

  const handleDelete = async () => {
    await deletePlaylist(playlist.id)
    navigate('/playlists')
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <div className="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="bg-muse-accent-subtle text-muse-accent flex h-20 w-20 shrink-0 items-center justify-center rounded-xl">
            <ListMusic className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-bold">{playlist.name}</h1>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Rename playlist"
                onClick={() => setRenameOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muse-text-muted mt-0.5 text-sm">
              {tracks.length} song{tracks.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete playlist
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={tracks.length === 0}
            onClick={() => void playerController.playFromQueue(trackIds, tracks[0]?.id)}
            className="gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            Play All
          </Button>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <ListMusic className="text-muse-text-muted mb-4 h-12 w-12" />
          <h2 className="text-muse-text mb-2 text-lg font-semibold">
            No tracks in this playlist
          </h2>
          <p className="text-muse-text-secondary text-sm">
            Right-click a track and choose “Add to playlist” to add it here.
          </p>
        </div>
      ) : (
        <>
          <div className="border-muse-glass-border text-muse-text-muted grid shrink-0 grid-cols-[2rem_4fr_3fr_1fr_3rem] gap-3 border-b px-3 pb-2 text-xs tracking-wider uppercase">
            <span className="text-center">#</span>
            <span>Title</span>
            <span>Album</span>
            <span className="text-right">Time</span>
            <span />
          </div>
          <div className="min-h-0 flex-1 pt-1">
            <TrackList
              tracks={tracks}
              onPlayTrack={(trackId) =>
                void playerController.playFromQueue(trackIds, trackId)
              }
              onRemoveFromPlaylist={(trackId) =>
                void removeTrackFromPlaylist(playlist.id, trackId)
              }
            />
          </div>
        </>
      )}

      <RenamePlaylistDialog
        open={renameOpen}
        name={playlist.name}
        onOpenChange={setRenameOpen}
        onRename={handleRename}
      />
      <DeletePlaylistDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={() => void handleDelete()}
      />
    </div>
  )
}

function RenamePlaylistDialog({
  open,
  name,
  onOpenChange,
  onRename,
}: {
  open: boolean
  name: string
  onOpenChange: (open: boolean) => void
  onRename: (name: string) => Promise<void>
}) {
  const [nextName, setNextName] = useState(name)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setNextName(name)
    onOpenChange(nextOpen)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="border-muse-glass-border bg-muse-bg-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-xl">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const trimmedName = nextName.trim()
              if (trimmedName) void onRename(trimmedName)
            }}
          >
            <Dialog.Title className="text-muse-text text-lg font-semibold">
              Rename playlist
            </Dialog.Title>
            <label
              className="text-muse-text mt-5 block text-sm font-medium"
              htmlFor="rename-playlist-name"
            >
              Playlist name
            </label>
            <input
              id="rename-playlist-name"
              autoFocus
              value={nextName}
              onChange={(event) => setNextName(event.target.value)}
              className="border-muse-glass-border bg-muse-bg-hover text-muse-text focus:ring-muse-accent mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={!nextName.trim()}>
                Save name
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function DeletePlaylistDialog({
  open,
  onOpenChange,
  onDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="border-muse-glass-border bg-muse-bg-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-xl">
          <Dialog.Title className="text-muse-text text-lg font-semibold">
            Delete this playlist?
          </Dialog.Title>
          <Dialog.Description className="text-muse-text-muted mt-2 text-sm">
            This permanently deletes the playlist. Your music files will not be removed.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant="danger" size="sm" onClick={onDelete}>
              Delete playlist
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PlaylistDetailLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="bg-muse-bg-surface skeleton h-20 w-full rounded-xl" />
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-muse-bg-surface skeleton h-14 rounded" />
      ))}
    </div>
  )
}

function PlaylistNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <ListMusic className="text-muse-text-muted mb-4 h-12 w-12" />
      <h1 className="text-muse-text mb-2 text-lg font-semibold">Playlist not found</h1>
      <p className="text-muse-text-secondary mb-6 text-sm">It may have been deleted.</p>
      <Button onClick={onBack} className="gap-2">
        <Music2 className="h-4 w-4" />
        Back to Playlists
      </Button>
    </div>
  )
}
