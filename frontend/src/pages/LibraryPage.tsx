import { useEffect, useState } from 'react'
import { getLibrarySnapshot, type LibrarySnapshot } from '../lib/library'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; snapshot: LibrarySnapshot }
  | { status: 'error'; message: string }

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function LibraryPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function loadLibrary() {
      try {
        const snapshot = await getLibrarySnapshot()
        if (!cancelled) {
          setState({ status: 'ready', snapshot })
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : 'Failed to load the library snapshot.'
          setState({ status: 'error', message })
        }
      }
    }

    void loadLibrary()

    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'loading') {
    return (
      <section className="p-6 md:p-8">
        <div className="rounded-3xl border border-[var(--border)] bg-white/70 p-6 shadow-[var(--shadow)] dark:bg-white/5">
          <h1 className="text-3xl font-semibold text-[var(--text-h)]">Library</h1>
          <p className="mt-3 text-sm opacity-80">Loading your offline library snapshot…</p>
        </div>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className="p-6 md:p-8">
        <div className="rounded-3xl border border-red-300/70 bg-red-50 p-6 text-left dark:border-red-900 dark:bg-red-950/30">
          <h1 className="text-3xl font-semibold text-[var(--text-h)]">Library</h1>
          <p className="mt-3 text-sm text-red-700 dark:text-red-300">{state.message}</p>
        </div>
      </section>
    )
  }

  const { snapshot } = state

  return (
    <section className="p-6 md:p-8">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,244,255,0.82))] p-6 shadow-[var(--shadow)] dark:bg-[linear-gradient(135deg,rgba(30,32,40,0.96),rgba(22,23,29,0.96))]">
        <div className="flex flex-col gap-6 text-left">
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
                Offline-first
              </p>
              <h1 className="mt-2 text-4xl font-semibold text-[var(--text-h)]">
                {snapshot.libraryName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm opacity-80">
                This view is now backed by a real Tauri command, which gives us a clean seam for
                replacing sample data with SQLite-backed imports next.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:min-w-72">
              <div className="rounded-2xl border border-[var(--border)] bg-white/75 p-4 dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.18em] opacity-60">Tracks</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--text-h)]">
                  {snapshot.trackCount}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-white/75 p-4 dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.18em] opacity-60">Runtime</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--text-h)]">
                  {formatDuration(snapshot.totalDurationSeconds)}
                </div>
              </div>
            </div>
          </header>

          <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white/80 dark:bg-black/10">
            <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_88px] gap-4 border-b border-[var(--border)] px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] opacity-60">
              <span>Track</span>
              <span>Artist</span>
              <span>Album</span>
              <span className="text-right">Time</span>
            </div>

            <div>
              {snapshot.tracks.map((track) => (
                <article
                  key={track.id}
                  className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_88px] gap-4 border-b border-[var(--border)]/80 px-5 py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-[var(--text-h)]">{track.title}</div>
                    <div className="mt-1 truncate text-xs opacity-65">{track.relativePath}</div>
                  </div>
                  <div className="truncate">{track.artist}</div>
                  <div className="truncate">{track.album}</div>
                  <div className="text-right font-medium text-[var(--text-h)]">
                    {formatDuration(track.durationSeconds)}
                    <div className="mt-1 text-xs font-normal opacity-60">{track.format}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
