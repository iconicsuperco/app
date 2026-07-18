import { expect, test } from '@playwright/test'
import path from 'node:path'

test('now playing visualizer can be toggled and cycled', async ({ page }) => {
  await page.goto('/import')
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Select Files' }).click()
  await (await chooser).setFiles(path.resolve('e2e/fixtures/e2e-test-song.mp3'))
  await page.getByText('E2E Test Song', { exact: true }).first().click()
  await page.getByRole('button', { name: 'Open now playing' }).click()
  await expect(page.getByLabel('Visualizer: bars')).toBeVisible()
  await page.getByRole('button', { name: 'Visualizer style: bars' }).click()
  await expect(page.getByLabel('Visualizer: radial')).toBeVisible()
  await page.getByRole('button', { name: 'Hide visualizer' }).click()
  await expect(page.getByLabel('Visualizer: radial')).toBeHidden()
})
