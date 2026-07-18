import { create } from 'zustand'

interface QueueState {
  /** Ordered track ids for the current queue */
  queue: string[]

  /** Index of the currently playing track in the queue */
  currentIndex: number

  /** Original order before shuffle was applied (for unshuffle) */
  originalOrder: string[]

  /** History of played track ids (for "previous") */
  history: string[]

  // Actions
  setQueue: (trackIds: string[], startIndex?: number) => void
  addToQueue: (trackId: string, position?: 'next' | 'end') => void
  removeFromQueue: (index: number) => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  clearQueue: () => void
  next: () => string | null
  previous: () => string | null
  getCurrentTrackId: () => string | null
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  originalOrder: [],
  history: [],

  setQueue: (trackIds, startIndex = 0) => {
    set({
      queue: [...trackIds],
      currentIndex: startIndex,
      originalOrder: [...trackIds],
      history: [],
    })
  },

  addToQueue: (trackId, position = 'end') => {
    const { queue, currentIndex, originalOrder } = get()
    if (position === 'next') {
      const insertAt = currentIndex + 1
      const newQueue = [...queue]
      newQueue.splice(insertAt, 0, trackId)
      set({ queue: newQueue, originalOrder: [...originalOrder, trackId] })
    } else {
      set({
        queue: [...queue, trackId],
        originalOrder: [...originalOrder, trackId],
      })
    }
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get()
    const newQueue = queue.filter((_, i) => i !== index)
    const newIndex = index < currentIndex ? currentIndex - 1 : currentIndex
    set({ queue: newQueue, currentIndex: newIndex })
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue } = get()
    const newQueue = [...queue]
    const [moved] = newQueue.splice(fromIndex, 1)
    if (moved) {
      newQueue.splice(toIndex, 0, moved)
    }
    set({ queue: newQueue })
  },

  clearQueue: () => set({ queue: [], currentIndex: -1, originalOrder: [], history: [] }),

  next: () => {
    const { queue, currentIndex, history } = get()
    if (queue.length === 0) return null

    // Push current to history
    const currentId = queue[currentIndex]
    const newHistory = currentId ? [...history, currentId] : history

    const nextIndex = currentIndex + 1
    if (nextIndex < queue.length) {
      set({ currentIndex: nextIndex, history: newHistory })
      return queue[nextIndex] ?? null
    }

    // Loop back to start
    set({ currentIndex: 0, history: newHistory })
    return queue[0] ?? null
  },

  previous: () => {
    const { queue, currentIndex, history } = get()
    if (queue.length === 0) return null

    // If we have history, jump back through it
    if (history.length > 0) {
      const newHistory = [...history]
      const prevId = newHistory.pop()
      const prevIndex = prevId ? queue.indexOf(prevId) : -1
      set({
        history: newHistory,
        currentIndex: prevIndex >= 0 ? prevIndex : currentIndex,
      })
      return prevId ?? null
    }

    const prevIndex = Math.max(0, currentIndex - 1)
    set({ currentIndex: prevIndex })
    return queue[prevIndex] ?? null
  },

  getCurrentTrackId: () => {
    const { queue, currentIndex } = get()
    return queue[currentIndex] ?? null
  },
}))
