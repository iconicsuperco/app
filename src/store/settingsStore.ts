import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EQPreset } from '@/types'

export const EQ_PRESETS: EQPreset[] = [
  { name: 'Flat', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost', bands: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: 'Treble Boost', bands: [0, 0, 0, 0, 0, 0, 2, 4, 5, 6] },
  { name: 'Vocal', bands: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2] },
  { name: 'Electronic', bands: [5, 4, 2, 0, -1, -1, 0, 2, 4, 5] },
  { name: 'Rock', bands: [4, 2, -1, -1, 0, 1, 2, 3, 4, 4] },
  { name: 'Jazz', bands: [3, 2, 1, 2, 0, -1, 0, 1, 2, 3] },
  { name: 'Classical', bands: [4, 3, 2, 1, 0, 0, 0, 1, 3, 4] },
  { name: 'Lo-Fi', bands: [3, 4, 2, 0, -2, -1, 0, 1, 2, 3] },
]

const EQ_BAND_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

interface SettingsState {
  // Audio
  crossfadeEnabled: boolean
  crossfadeDuration: number // seconds
  gaplessEnabled: boolean

  // EQ
  eqEnabled: boolean
  eqBands: number[] // 10 values, each -12 to +12 dB
  eqPresetName: string | null

  // Visual
  accentColor: string
  themePreset: 'dark' | 'midnight' | 'ocean'

  // Visualizer
  visualizerEnabled: boolean
  visualizerStyle: 'bars' | 'radial' | 'waveform'

  // Actions
  setCrossfadeEnabled: (enabled: boolean) => void
  setCrossfadeDuration: (duration: number) => void
  setGaplessEnabled: (enabled: boolean) => void
  setEqEnabled: (enabled: boolean) => void
  setEqBands: (bands: number[]) => void
  setEqPreset: (presetName: string) => void
  setAccentColor: (color: string) => void
  setThemePreset: (preset: SettingsState['themePreset']) => void
  setVisualizerEnabled: (enabled: boolean) => void
  setVisualizerStyle: (style: SettingsState['visualizerStyle']) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      crossfadeEnabled: false,
      crossfadeDuration: 3,
      gaplessEnabled: true,
      eqEnabled: false,
      eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      eqPresetName: null,
      accentColor: '#8b5cf6',
      themePreset: 'dark',
      visualizerEnabled: true,
      visualizerStyle: 'bars',

      setCrossfadeEnabled: (enabled) => set({ crossfadeEnabled: enabled }),
      setCrossfadeDuration: (duration) => set({ crossfadeDuration: duration }),
      setGaplessEnabled: (enabled) => set({ gaplessEnabled: enabled }),
      setEqEnabled: (enabled) => set({ eqEnabled: enabled }),
      setEqBands: (bands) => set({ eqBands: bands, eqPresetName: null }),
      setEqPreset: (presetName) => {
        const preset = EQ_PRESETS.find((p) => p.name === presetName)
        if (preset) {
          set({ eqBands: preset.bands, eqPresetName: preset.name, eqEnabled: true })
        }
      },
      setAccentColor: (color) => set({ accentColor: color }),
      setThemePreset: (preset) => set({ themePreset: preset }),
      setVisualizerEnabled: (enabled) => set({ visualizerEnabled: enabled }),
      setVisualizerStyle: (style) => set({ visualizerStyle: style }),
    }),
    {
      name: 'muse-settings',
    },
  ),
)

export { EQ_BAND_FREQUENCIES }
