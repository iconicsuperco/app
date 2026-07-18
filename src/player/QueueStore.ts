import { create } from 'zustand'
import { usePlayerStore } from '@/player/PlayerStore'


interface QueueState {
  /** Ordered track ids for the current queue */
  queue: string[]

  /** Index of the currently playing track in the queue */
  currentIndex: number

  /** Original order before shuffle was applied (for unshuffle) */
  originalOrder: string[]

  /** History of played track ids (for "previous") */
  history: string[]

  /**
   * Shuffle cycle derived state:
   * - shuffledOrder is a random permutation of `queue` captured for the current cycle
   * - shuffleCursor is the index within shuffledOrder
   * - shuffleRemaining tracks which ids haven't been played in this cycle yet
   */
  shuffledOrder: string[] | null
  shuffleCursor: number
  shuffleRemaining: string[]
  shuffledQueueKey: string

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

  /** Shuffle cycle derived state (internal, but kept in store for consistent next/previous). */
  shuffledOrder: null,
  shuffleCursor: 0,
  shuffleRemaining: [],
  shuffledQueueKey: '',

  setQueue: (trackIds, startIndex = 0) => {
    set({
      queue: [...trackIds],
      currentIndex: startIndex,
      originalOrder: [...trackIds],
      history: [],
      shuffledOrder: null,
      shuffleCursor: 0,
      shuffleRemaining: [],
      shuffledQueueKey: '',
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
    const { queue, currentIndex, history, shuffledQueueKey, shuffledOrder, shuffleRemaining } = get()
    if (queue.length === 0) return null

    const { shuffle, repeatMode } = usePlayerStore.getState()


    const currentId: string | null = queue[currentIndex] ?? null
    const newHistory = currentId ? [...history, currentId] : history

    const queueKey = queue.join('|')
    const ensureShuffle = () => {
      if (!shuffle) return null
      if (shuffledOrder && shuffledQueueKey === queueKey) return { shuffledOrder, shuffleRemaining }
      // Generate a fresh random permutation for this queue cycle
      const order = [...queue]
      // Fisher-Yates (with noUncheckedIndexedAccess-safe swap)
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const a = order[i]
        const b = order[j]
        if (a === undefined || b === undefined) continue
        order[i] = b
        order[j] = a
      }
      // Remaining is the full order initially
      set({
        shuffledOrder: order,
        shuffledQueueKey: queueKey,
        shuffleRemaining: [...order],
        shuffleCursor: 0,
      })
      return { shuffledOrder: order, shuffleRemaining: [...order] }
    }

    if (!shuffle) {
      const nextIndex = currentIndex + 1
      if (nextIndex < queue.length) {
        set({ currentIndex: nextIndex, history: newHistory })
        return queue[nextIndex] ?? null
      }
      // Queue end reached. Only repeat-all should loop; repeat-off should stop.
      if (repeatMode === 'all') {
        set({ currentIndex: 0, history: newHistory })
        return queue[0] ?? null
      }
      return null
    }

    const ensured = ensureShuffle()
    if (!ensured) return null
    const { shuffleRemaining: sr } = ensured

    // If everything has played once in this shuffle cycle:
    if (sr.length === 0) {
      if (repeatMode === 'all') {
        // reset cycle by forcing regeneration
        set({
          shuffledOrder: null,
          shuffledQueueKey: '',
          shuffleCursor: 0,
          shuffleRemaining: [],
        })
        return get().next()
      }
      return null
    }

    // Remove current from remaining if present to avoid immediate repeat.
    let remaining = sr
    if (currentId && remaining.includes(currentId)) {
      remaining = remaining.filter((id) => id !== currentId)
    }

    const nextIdMaybe = remaining[0]
    if (!nextIdMaybe || nextIdMaybe.length === 0) return null
    const nextId = nextIdMaybe

    const nextIndex = queue.indexOf(nextId)
    set({
      currentIndex: nextIndex,
      history: newHistory,
      shuffleRemaining: remaining.slice(1),
    })
    return nextId
  },

  previous: () => {
    const { queue, currentIndex, history } = get()
    if (queue.length === 0) return null

    const { shuffle } = usePlayerStore.getState()


    if (shuffle) {
      // Under shuffle, rely on history for "previous" (tracks actually played).
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
      return null
    }

    // Unshuffled: history-first, then index step back.
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
