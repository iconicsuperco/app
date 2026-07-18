import { Download, Trash2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { clearLibraryData, exportLibraryData } from '@/library/libraryData'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { EqualizerPanel } from '@/features/equalizer/EqualizerPanel'

const THEMES = [
  { value: 'dark', label: 'Dark' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'ocean', label: 'Ocean' },
] as const

const ACCENT_COLORS = ['#8b5cf6', '#3b82f6', '#14b8a6', '#f43f5e', '#f59e0b']

export function SettingsPage() {
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [equalizerOpen, setEqualizerOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const crossfadeEnabled = useSettingsStore((s) => s.crossfadeEnabled)
  const gaplessEnabled = useSettingsStore((s) => s.gaplessEnabled)
  const accentColor = useSettingsStore((s) => s.accentColor)
  const themePreset = useSettingsStore((s) => s.themePreset)
  const setCrossfadeEnabled = useSettingsStore((s) => s.setCrossfadeEnabled)
  const setGaplessEnabled = useSettingsStore((s) => s.setGaplessEnabled)
  const setAccentColor = useSettingsStore((s) => s.setAccentColor)
  const setThemePreset = useSettingsStore((s) => s.setThemePreset)
  const addToast = useUIStore((s) => s.addToast)

  const handleExport = async () => {
    try {
      const library = await exportLibraryData()
      const blob = new Blob([JSON.stringify(library, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `muse-library-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      addToast('Library exported as JSON', 'success')
    } catch (error) {
      console.error('Library export failed', error)
      addToast('Could not export library', 'error')
    }
  }

  const handleConfirmClear = async () => {
    setIsClearing(true)
    try {
      await clearLibraryData()
      setClearDialogOpen(false)
      addToast('Library cleared', 'success')
    } catch (error) {
      console.error('Library clear failed', error)
      addToast('Could not clear library', 'error')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <SettingSection title="Audio">
          <SettingRow label="Crossfade" description="Smooth transition between tracks">
            <Toggle checked={crossfadeEnabled} onCheckedChange={setCrossfadeEnabled} label="Crossfade" />
          </SettingRow>
          <SettingRow label="Gapless Playback" description="Seamless playback between tracks">
            <Toggle checked={gaplessEnabled} onCheckedChange={setGaplessEnabled} label="Gapless Playback" />
          </SettingRow>
          <SettingRow label="Equalizer" description="Customize audio frequencies">
            <Button variant="secondary" size="sm" onClick={() => setEqualizerOpen(true)}>Open equalizer</Button>
          </SettingRow>
        </SettingSection>
        <SettingSection title="Appearance">
          <SettingRow label="Theme" description="Dark, Midnight, or Ocean">
            <div className="flex rounded-lg bg-muse-bg-hover p-1" role="radiogroup" aria-label="Theme">
              {THEMES.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  role="radio"
                  aria-checked={themePreset === theme.value}
                  onClick={() => setThemePreset(theme.value)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    themePreset === theme.value
                      ? 'bg-muse-accent text-white'
                      : 'text-muse-text-muted hover:text-muse-text'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Accent Color" description="Customize the app accent color">
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Accent color">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-label={`Use ${color} accent`}
                  aria-checked={accentColor === color}
                  onClick={() => setAccentColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    accentColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </SettingRow>
        </SettingSection>
        <SettingSection title="Data">
          <SettingRow label="Export Library" description="Download your library data as JSON">
            <Button variant="secondary" size="sm" onClick={() => void handleExport()} className="gap-2">
              <Download className="w-4 h-4" />
              Export JSON
            </Button>
          </SettingRow>
          <SettingRow label="Clear Library" description="Remove all music and data">
            <Button variant="secondary" size="sm" onClick={() => setClearDialogOpen(true)} className="gap-2 text-muse-error">
              <Trash2 className="w-4 h-4" />
              Clear library
            </Button>
          </SettingRow>
        </SettingSection>
      </div>
      <ClearLibraryDialog
        open={clearDialogOpen}
        isClearing={isClearing}
        onOpenChange={setClearDialogOpen}
        onConfirm={() => void handleConfirmClear()}
      />
      <EqualizerPanel open={equalizerOpen} onOpenChange={setEqualizerOpen} />
    </div>
  )
}

function ClearLibraryDialog({
  open,
  isClearing,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  isClearing: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-muse-glass-border bg-muse-bg-surface p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-muse-text">Clear your library?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muse-text-muted">
            This permanently removes all music, playlists, artwork, and listening history. This action cannot be undone.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm" disabled={isClearing}>Cancel</Button>
            </Dialog.Close>
            <Button
              variant="primary"
              size="sm"
              disabled={isClearing}
              onClick={onConfirm}
              className="bg-muse-error hover:bg-muse-error/80"
            >
              {isClearing ? 'Clearing…' : 'Clear library permanently'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muse-text-muted uppercase tracking-wider">{title}</h2>
      <div className="bg-muse-bg-surface rounded-xl border border-muse-glass-border divide-y divide-muse-glass-border">
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-muse-text">{label}</p>
        <p className="text-xs text-muse-text-muted">{description}</p>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`w-10 h-6 rounded-full p-0.5 transition-colors ${checked ? 'bg-muse-accent' : 'bg-muse-bg-hover'}`}
    >
      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}
