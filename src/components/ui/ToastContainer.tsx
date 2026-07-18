import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-[calc(var(--player-height)+16px)] right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg',
              'glass border border-muse-glass-border shadow-xl shadow-black/30',
              'min-w-[280px] max-w-[400px]',
              toast.type === 'success' && 'border-green-500/30',
              toast.type === 'error' && 'border-red-500/30',
            )}
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                toast.type === 'success' && 'bg-muse-success',
                toast.type === 'error' && 'bg-muse-error',
                toast.type === 'info' && 'bg-muse-accent',
              )}
            />
            <p className="text-sm text-muse-text flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muse-text-muted hover:text-muse-text shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
