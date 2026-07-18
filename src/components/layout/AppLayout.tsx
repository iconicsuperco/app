import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { useUIStore } from '@/store/uiStore'
import { ToastContainer } from '@/components/ui/ToastContainer'

export function AppLayout() {
  const { nowPlayingOpen, queueOpen } = useUIStore()

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>

        {/* Mini Player bar */}
        <MiniPlayer />
      </div>

      {/* Full-screen Now Playing overlay */}
      <AnimatePresence>
        {nowPlayingOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-muse-bg"
          >
            <NowPlayingPlaceholder onClose={() => useUIStore.getState().setNowPlayingOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue panel */}
      <AnimatePresence>
        {queueOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-[var(--player-height)] w-80 z-30 glass border-l border-muse-glass-border"
          >
            <QueuePlaceholder onClose={() => useUIStore.getState().setQueueOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}

/** Placeholder for Now Playing full screen (Phase 3) */
function NowPlayingPlaceholder({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muse-text-muted">
      <div className="w-64 h-64 rounded-2xl bg-muse-bg-surface" />
      <h2 className="text-2xl font-bold text-muse-text">Now Playing</h2>
      <p className="text-sm">Full screen player coming in Phase 3</p>
      <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg bg-muse-bg-surface hover:bg-muse-bg-hover text-sm">
        Close
      </button>
    </div>
  )
}

/** Placeholder for Queue panel (Phase 3) */
function QueuePlaceholder({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Queue</h2>
        <button onClick={onClose} className="text-sm text-muse-text-muted hover:text-muse-text">
          Close
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center text-muse-text-muted text-sm">
        Queue view coming in Phase 3
      </div>
    </div>
  )
}
