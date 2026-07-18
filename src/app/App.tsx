import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { playerController } from '@/audio/PlayerController'
import { audioEngine } from '@/audio/AudioEngine'
import { usePlayerStore } from '@/player/PlayerStore'
import { useSettingsStore } from '@/store/settingsStore'

export function App() {
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

  return <RouterProvider router={router} />
}
