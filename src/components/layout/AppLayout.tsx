import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { useUIStore } from '@/store/uiStore'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { NowPlayingView } from '@/features/now-playing/NowPlayingView'
import { QueuePanel } from '@/features/queue/QueuePanel'
import { CommandPalette } from '@/features/command-palette/CommandPalette'

export function AppLayout() {
  const { nowPlayingOpen, queueOpen } = useUIStore()

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
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
            className="bg-muse-bg fixed inset-0 z-40"
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
            className="glass border-muse-glass-border fixed top-0 right-0 bottom-[var(--player-height)] z-30 w-80 border-l"
          >
            <QueuePanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <ToastContainer />
      <CommandPalette />
    </div>
  )
}
