import { create } from 'zustand'
import type { PlaybackStatus, RepeatMode } from '@/types'

interface PlayerState {
  // Current track
  currentTrackId: string | null
  status: PlaybackStatus

  // Position
  position: number
  duration: number
  buffered: number

  // Playback
  volume: number
  muted: boolean
  repeatMode: RepeatMode
  shuffle: boolean
  playbackRate: number

  // Actions
  setCurrentTrack: (trackId: string | null) => void
  setStatus: (status: PlaybackStatus) => void
  setPosition: (position: number) => void
  setDuration: (duration: number) => void
  setBuffered: (buffered: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setRepeatMode: (mode: RepeatMode) => void
  cycleRepeatMode: () => void
  toggleShuffle: () => void
  setPlaybackRate: (rate: number) => void
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  reset: () => void
}

const repeatOrder: RepeatMode[] = ['off', 'all', 'one']

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrackId: null,
  status: 'idle',
  position: 0,
  duration: 0,
  buffered: 0,
  volume: 0.75,
  muted: false,
  repeatMode: 'off',
  shuffle: false,
  playbackRate: 1,

  setCurrentTrack: (trackId) => set({ currentTrackId: trackId, position: 0, duration: 0 }),
  setStatus: (status) => set({ status }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setBuffered: (buffered) => set({ buffered }),
  setVolume: (volume) => set({ volume, muted: false }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setRepeatMode: (mode) => set({ repeatMode: mode }),
  cycleRepeatMode: () => {
    const current = get().repeatMode
    const next = repeatOrder[(repeatOrder.indexOf(current) + 1) % repeatOrder.length]
    set({ repeatMode: next })
  },
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  play: () => set({ status: 'playing' }),
  pause: () => set({ status: 'paused' }),
  togglePlayPause: () => {
    const { status } = get()
    set({ status: status === 'playing' ? 'paused' : 'playing' })
  },
  reset: () =>
    set({
      currentTrackId: null,
      status: 'idle',
      position: 0,
      duration: 0,
      buffered: 0,
    }),
}))
