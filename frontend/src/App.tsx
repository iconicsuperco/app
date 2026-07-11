import { useRoutes } from 'react-router-dom'
import { MuseSidebar } from './components/MuseSidebar'
import { routes } from './routes'

export default function App() {
  const content = useRoutes(routes)

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="flex h-screen">
        <MuseSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">{content}</div>

          <div className="border-t border-[var(--border)] bg-white/50 backdrop-blur dark:bg-black/30">
            <div className="px-4 py-3 text-sm text-[var(--text-h)]">
              Player controls will land next. The library is now wired through Tauri.
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
