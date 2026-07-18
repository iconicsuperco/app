import { Command } from 'cmdk'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import {
  allAlbumsQuery,
  allArtistsQuery,
  allPlaylistsQuery,
  allTracksQuery,
} from '@/library/queries'
import { playerController } from '@/audio/PlayerController'
import { usePlayerStore } from '@/player/PlayerStore'
import { useUIStore } from '@/store/uiStore'
import { useSettingsStore } from '@/store/settingsStore'

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const tracks = useLiveQuery(() => allTracksQuery(), []) ?? []
  const albums = useLiveQuery(() => allAlbumsQuery(), []) ?? []
  const artists = useLiveQuery(() => allArtistsQuery(), []) ?? []
  const playlists = useLiveQuery(() => allPlaylistsQuery(), []) ?? []
  const navigate = useNavigate()
  const close = () => setOpen(false)
  const select = (path: string) => {
    navigate(path)
    close()
  }
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-[15vh]"
      onMouseDown={close}
    >
      <Command
        className="border-muse-glass-border bg-muse-bg-surface w-[min(92vw,42rem)] overflow-hidden rounded-xl border shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Command.Input
          autoFocus
          placeholder="Search music and commands…"
          className="border-muse-glass-border text-muse-text w-full border-b bg-transparent px-4 py-4 outline-none"
        />
        <Command.List className="max-h-[55vh] overflow-y-auto p-2 text-sm">
          <Command.Empty className="text-muse-text-muted p-4">
            No results found.
          </Command.Empty>
          <Command.Group heading="Navigate" className="text-muse-text-muted">
            {[
              ['Home', '/'],
              ['Songs', '/songs'],
              ['Albums', '/albums'],
              ['Artists', '/artists'],
              ['Playlists', '/playlists'],
              ['Favorites', '/favorites'],
              ['Settings', '/settings'],
            ].map(([name, path]) => (
              <Command.Item
                key={path}
                value={name}
                onSelect={() => select(path!)}
                className="text-muse-text aria-selected:bg-muse-bg-hover cursor-pointer rounded px-3 py-2"
              >
                {name}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Search results" className="text-muse-text-muted">
            {tracks.map((t) => (
              <Command.Item
                key={t.id}
                value={`${t.title} ${t.artist}`}
                onSelect={() => {
                  void playerController.playFromQueue(
                    tracks.map((x) => x.id),
                    t.id,
                  )
                  close()
                }}
                className="text-muse-text aria-selected:bg-muse-bg-hover cursor-pointer rounded px-3 py-2"
              >
                {t.title} — {t.artist}
              </Command.Item>
            ))}
            {albums.map((a) => (
              <Command.Item
                key={a.id}
                value={`album ${a.title}`}
                onSelect={() => select(`/album/${a.id}`)}
                className="text-muse-text aria-selected:bg-muse-bg-hover cursor-pointer rounded px-3 py-2"
              >
                Album: {a.title}
              </Command.Item>
            ))}
            {artists.map((a) => (
              <Command.Item
                key={a.id}
                value={`artist ${a.name}`}
                onSelect={() => select(`/artist/${a.id}`)}
                className="text-muse-text aria-selected:bg-muse-bg-hover cursor-pointer rounded px-3 py-2"
              >
                Artist: {a.name}
              </Command.Item>
            ))}
            {playlists.map((p) => (
              <Command.Item
                key={p.id}
                value={`playlist ${p.name}`}
                onSelect={() => select(`/playlist/${p.id}`)}
                className="text-muse-text aria-selected:bg-muse-bg-hover cursor-pointer rounded px-3 py-2"
              >
                Playlist: {p.name}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Actions" className="text-muse-text-muted">
            <Actions close={close} />
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  )
}
function Actions({ close }: { close: () => void }) {
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeatMode = usePlayerStore((s) => s.cycleRepeatMode)
  const setNowPlayingOpen = useUIStore((s) => s.setNowPlayingOpen)
  const toggleQueue = useUIStore((s) => s.toggleQueue)
  const setEq = useSettingsStore((s) => s.setEqEnabled)
  const eq = useSettingsStore((s) => s.eqEnabled)
  const item = (name: string, fn: () => void) => (
    <Command.Item
      value={name}
      onSelect={() => {
        fn()
        close()
      }}
      className="text-muse-text aria-selected:bg-muse-bg-hover cursor-pointer rounded px-3 py-2"
    >
      {name}
    </Command.Item>
  )
  return (
    <>
      {item('Play / Pause', () => void playerController.togglePlayPause())}
      {item('Next track', () => void playerController.next())}
      {item('Previous track', () => void playerController.previous())}
      {item('Toggle shuffle', toggleShuffle)}
      {item('Cycle repeat', cycleRepeatMode)}
      {item('Open Now Playing', () => setNowPlayingOpen(true))}
      {item('Open Queue', toggleQueue)}
      {item('Open Equalizer', () => setEq(!eq))}
    </>
  )
}
