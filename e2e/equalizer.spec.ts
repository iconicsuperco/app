import { expect, test } from '@playwright/test'

async function getEqualizerState(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const { useSettingsStore } = await import('/src/store/settingsStore.ts')
    const { eqBands, eqEnabled, eqPresetName } = useSettingsStore.getState()
    return { eqBands, eqEnabled, eqPresetName }
  })
}

test('equalizer controls update the persisted settings store', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Open equalizer' }).click()

  const equalizer = page.getByRole('dialog')
  await expect(equalizer.getByRole('heading', { name: 'Equalizer' })).toBeVisible()
  await expect(equalizer.getByRole('slider')).toHaveCount(10)

  await equalizer.getByRole('slider', { name: '32Hz band' }).press('ArrowUp')
  await expect.poll(async () => (await getEqualizerState(page)).eqBands[0]).toBe(1)

  await equalizer.getByLabel('Equalizer preset').selectOption('Bass Boost')
  await expect.poll(async () => getEqualizerState(page)).toMatchObject({
    eqPresetName: 'Bass Boost',
    eqEnabled: true,
    eqBands: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  })

  await equalizer.getByRole('switch', { name: 'Equalizer enabled' }).click()
  await expect.poll(async () => (await getEqualizerState(page)).eqEnabled).toBe(false)
})
