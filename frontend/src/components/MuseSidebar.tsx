import { NavLink } from 'react-router-dom'

export function MuseSidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-white/40 backdrop-blur dark:bg-black/25">
      <div className="p-4">
        <div className="text-xl font-semibold text-[var(--text-h)]">Muse</div>
        <nav className="mt-6 flex flex-col gap-1">
          <NavLink
            to="/library"
            className={({ isActive }) =>
              [
                'rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                  : 'text-[var(--text-h)]/80 hover:bg-white/60 dark:hover:bg-white/10',
              ].join(' ')
            }
          >
            Library
          </NavLink>

          <NavLink
            to="/home"
            className={({ isActive }) =>
              [
                'rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                  : 'text-[var(--text-h)]/80 hover:bg-white/60 dark:hover:bg-white/10',
              ].join(' ')
            }
          >
            Home
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}
