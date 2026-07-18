import { Search } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { allAlbumsQuery, allArtistsQuery, allTracksQuery } from '@/library/queries'
import { playerController } from '@/audio/PlayerController'
import { searchLibrary } from '@/library/search'
export function SearchPage() {
  const [q, setQ] = useState('')
  const tracks = useLiveQuery(() => allTracksQuery(), []) ?? []
  const albums = useLiveQuery(() => allAlbumsQuery(), []) ?? []
  const artists = useLiveQuery(() => allArtistsQuery(), []) ?? []
  const r = searchLibrary(q, tracks, albums, artists)
  const nav = useNavigate()
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Search</h1>
      <div className="relative mx-auto max-w-xl">
        <Search className="text-muse-text-muted absolute top-4 left-4 h-5 w-5" />
        <input
          autoFocus
          aria-label="Search library"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to listen to?"
          className="border-muse-glass-border bg-muse-bg-surface text-muse-text w-full rounded-full border py-3 pl-12"
        />
      </div>
      {!q ? (
        <p className="text-muse-text-muted py-20 text-center">
          Search your library for songs, albums, and artists
        </p>
      ) : (
        <div className="mx-auto mt-8 max-w-xl space-y-6">
          {r.tracks.length + r.albums.length + r.artists.length === 0 ? (
            <p className="text-muse-text-muted">No results found.</p>
          ) : (
            <>
              {section(
                'Songs',
                r.tracks.slice(0, 5).map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      void playerController.playFromQueue(
                        r.tracks.map((x) => x.id),
                        t.id,
                      )
                    }
                    className="text-muse-text block w-full text-left"
                  >
                    {t.title} — {t.artist}
                  </button>
                )),
              )}
              {section(
                'Albums',
                r.albums.slice(0, 5).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => nav(`/album/${a.id}`)}
                    className="text-muse-text block"
                  >
                    {a.title}
                  </button>
                )),
              )}
              {section(
                'Artists',
                r.artists.slice(0, 5).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => nav(`/artist/${a.id}`)}
                    className="text-muse-text block"
                  >
                    {a.name}
                  </button>
                )),
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
function section(name: string, items: React.ReactNode[]) {
  return items.length ? (
    <section>
      <h2 className="text-muse-text-muted mb-2 text-sm font-semibold">{name}</h2>
      <div className="space-y-2">{items}</div>
    </section>
  ) : null
}
