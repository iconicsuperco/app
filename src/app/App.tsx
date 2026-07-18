import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { playerController } from '@/audio/PlayerController'
import { audioEngine } from '@/audio/AudioEngine'
import { usePlayerStore } from '@/player/PlayerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'

export function App() {
  const accentColor = useSettingsStore((s) => s.accentColor)
  const themePreset = useSettingsStore((s) => s.themePreset)

  // Wire the audio engine ↔ stores once on app boot
  useEffect(() => {
    playerController.init()

    // Push initial volume/EQ settings into the engine (applied lazily on first play)
    const { volume, muted } = usePlayerStore.getState()
    audioEngine.setVolume(volume)
    audioEngine.setMuted(muted)

    // Keep engine in sync with settings store
    const unsubSettings = useSettingsStore.subscribe((s) => {
      audioEngine.equalizer?.setEnabled(s.eqEnabled)
      audioEngine.equalizer?.setBands(s.eqBands)
    })
    const unsubPlayer = usePlayerStore.subscribe((s) => {
      audioEngine.setVolume(s.volume)
      audioEngine.setMuted(s.muted)
      audioEngine.setPlaybackRate(s.playbackRate)
    })

    return () => {
      unsubSettings()
      unsubPlayer()
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = themePreset
    document.documentElement.style.setProperty('--color-accent', accentColor)
  }, [accentColor, themePreset])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        useUIStore
          .getState()
          .setCommandPaletteOpen(!useUIStore.getState().commandPaletteOpen)
      }
      if (event.key === 'Escape') useUIStore.getState().setCommandPaletteOpen(false)
      const target = event.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
      if (event.key === ' ') {
        event.preventDefault()
        void playerController.togglePlayPause()
      }
      if (event.key === 'ArrowLeft') playerController.seekBy(-10)
      if (event.key === 'ArrowRight') playerController.seekBy(10)
      if (event.key.toLowerCase() === 'n') void playerController.next()
      if (event.key.toLowerCase() === 'p') void playerController.previous()
      if (event.key.toLowerCase() === 's') usePlayerStore.getState().toggleShuffle()
      if (event.key.toLowerCase() === 'r') usePlayerStore.getState().cycleRepeatMode()
      if (event.key === '/') {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('[aria-label="Search library"]')?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return <RouterProvider router={router} />
}
