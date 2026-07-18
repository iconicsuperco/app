import { expect, test } from '@playwright/test'
import path from 'node:path'
test('local LRC lyrics import and render work', async ({ page }) => {
  await page.goto('/import')
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Select Files' }).click()
  await (await chooser).setFiles(path.resolve('e2e/fixtures/e2e-test-song.mp3'))
  await page.getByText('E2E Test Song', { exact: true }).first().click()
  await page.getByRole('button', { name: 'Open now playing' }).click()
  await page.getByRole('button', { name: 'Show lyrics' }).click()
  const lyrics = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Import .lrc' }).click()
  await (await lyrics).setFiles(path.resolve('e2e/fixtures/e2e-lyrics.lrc'))
  await expect(page.getByText('First E2E lyric')).toBeVisible()
  await page.getByText('Second E2E lyric').click()
})
