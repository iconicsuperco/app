import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { useUIStore } from '@/store/uiStore'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { NowPlayingView } from '@/features/now-playing/NowPlayingView'
import { QueuePanel } from '@/features/queue/QueuePanel'

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
            <NowPlayingView />
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
            <QueuePanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}
