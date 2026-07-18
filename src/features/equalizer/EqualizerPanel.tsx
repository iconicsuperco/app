import * as Dialog from '@radix-ui/react-dialog'
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { EQ_BAND_FREQUENCIES, EQ_PRESETS, useSettingsStore } from '@/store/settingsStore'

export function EqualizerPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const eqBands = useSettingsStore((s) => s.eqBands)
  const eqEnabled = useSettingsStore((s) => s.eqEnabled)
  const eqPresetName = useSettingsStore((s) => s.eqPresetName)
  const setEqBands = useSettingsStore((s) => s.setEqBands)
  const setEqEnabled = useSettingsStore((s) => s.setEqEnabled)
  const setEqPreset = useSettingsStore((s) => s.setEqPreset)

  const setBand = (index: number, value: number[]) => {
    const bands = [...eqBands]
    bands[index] = value[0] ?? 0
    setEqBands(bands)
  }

  const resetToFlat = () => {
    const flat = EQ_PRESETS.find((preset) => preset.name === 'Flat')
    if (flat) setEqBands([...flat.bands])
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-muse-glass-border bg-muse-bg-surface p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-muse-text">
                <SlidersHorizontal className="w-5 h-5 text-muse-accent" />
                Equalizer
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muse-text-muted">
                Adjust the 10-band equalizer or start from a preset.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close equalizer">
                <X className="w-4 h-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-muse-text-muted">
              Preset
              <select
                aria-label="Equalizer preset"
                value={eqPresetName ?? ''}
                onChange={(event) => setEqPreset(event.target.value)}
                className="rounded-md border border-muse-glass-border bg-muse-bg-hover px-3 py-1.5 text-sm text-muse-text focus:outline-none focus:ring-2 focus:ring-muse-accent"
              >
                <option value="" disabled>Custom</option>
                {EQ_PRESETS.map((preset) => <option key={preset.name} value={preset.name}>{preset.name}</option>)}
              </select>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-label="Equalizer enabled"
                aria-checked={eqEnabled}
                onClick={() => setEqEnabled(!eqEnabled)}
                className={`h-6 w-10 rounded-full p-0.5 transition-colors ${eqEnabled ? 'bg-muse-accent' : 'bg-muse-bg-hover'}`}
              >
                <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${eqEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm text-muse-text">{eqEnabled ? 'Enabled' : 'Bypassed'}</span>
              <Button variant="secondary" size="sm" onClick={resetToFlat} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset to Flat
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-5 gap-x-2 gap-y-8 sm:grid-cols-10">
            {EQ_BAND_FREQUENCIES.map((frequency, index) => {
              const value = eqBands[index] ?? 0
              return (
                <div key={frequency} className="flex h-52 flex-col items-center gap-2">
                  <span className="text-xs tabular-nums text-muse-text-muted">{formatGain(value)}</span>
                  <Slider
                    ariaLabel={`${formatFrequency(frequency)} band`}
                    value={[value]}
                    onValueChange={(next) => setBand(index, next)}
                    min={-12}
                    max={12}
                    step={1}
                    orientation="vertical"
                    className="h-36"
                  />
                  <span className="text-[10px] font-medium text-muse-text-muted">{formatFrequency(frequency)}</span>
                </div>
              )
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function formatFrequency(frequency: number): string {
  return frequency >= 1000 ? `${frequency / 1000}kHz` : `${frequency}Hz`
}

function formatGain(value: number): string {
  return `${value > 0 ? '+' : ''}${value} dB`
}
