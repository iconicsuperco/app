import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean

  // Player views
  nowPlayingOpen: boolean
  queueOpen: boolean
  commandPaletteOpen: boolean

  // Toasts
  toasts: Toast[]

  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setNowPlayingOpen: (open: boolean) => void
  toggleNowPlaying: () => void
  setQueueOpen: (open: boolean) => void
  toggleQueue: () => void
  setCommandPaletteOpen: (open: boolean) => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  nowPlayingOpen: false,
  queueOpen: false,
  commandPaletteOpen: false,
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setNowPlayingOpen: (open) => set({ nowPlayingOpen: open }),
  toggleNowPlaying: () => set((s) => ({ nowPlayingOpen: !s.nowPlayingOpen })),
  setQueueOpen: (open) => set({ queueOpen: open }),
  toggleQueue: () => set((s) => ({ queueOpen: !s.queueOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    // Auto-remove after 3 seconds
    setTimeout(() => get().removeToast(id), 3000)
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
