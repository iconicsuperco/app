import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsPage } from './SettingsPage'
import { useSettingsStore } from '@/store/settingsStore'

const libraryActions = vi.hoisted(() => ({
  clearLibraryData: vi.fn(),
  exportLibraryData: vi.fn(),
}))

vi.mock('@/library/libraryData', () => libraryActions)

describe('SettingsPage', () => {
  beforeEach(() => {
    useSettingsStore.persist.setOptions({
      storage: {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      },
    })
    useSettingsStore.setState({
      accentColor: '#8b5cf6',
      themePreset: 'dark',
      crossfadeEnabled: false,
      gaplessEnabled: true,
      eqEnabled: false,
    })
    libraryActions.clearLibraryData.mockReset()
    libraryActions.exportLibraryData.mockReset()
  })

  it('renders interactive appearance controls instead of switches', () => {
    render(<SettingsPage />)

    fireEvent.click(screen.getByRole('radio', { name: 'Midnight' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Use #3b82f6 accent' }))

    expect(useSettingsStore.getState().themePreset).toBe('midnight')
    expect(useSettingsStore.getState().accentColor).toBe('#3b82f6')
    expect(screen.getByRole('button', { name: 'Export JSON' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Clear library' })).not.toBeNull()
  })

  it('exports data and clears it only after confirmation', async () => {
    libraryActions.exportLibraryData.mockResolvedValue({ version: 1 })
    libraryActions.clearLibraryData.mockResolvedValue(undefined)
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:library'),
      revokeObjectURL: vi.fn(),
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<SettingsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }))
    await waitFor(() => expect(libraryActions.exportLibraryData).toHaveBeenCalledOnce())

    fireEvent.click(screen.getByRole('button', { name: 'Clear library' }))
    expect(libraryActions.clearLibraryData).not.toHaveBeenCalled()

    confirm.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Clear library' }))
    await waitFor(() => expect(libraryActions.clearLibraryData).toHaveBeenCalledOnce())
    expect(window.confirm).toHaveBeenCalledTimes(2)
  })
})
