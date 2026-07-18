import { expect, test } from '@playwright/test'
import path from 'node:path'

test('command palette opens, plays search results, navigates, and closes', async ({
  page,
}) => {
  await page.goto('/import')
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Select Files' }).click()
  await (await chooser).setFiles(path.resolve('e2e/fixtures/e2e-test-song.mp3'))
  await expect(page).toHaveURL(/\/songs/)

  await page.keyboard.press('Meta+k')
  const palette = page.locator('[cmdk-root]')
  await expect(palette).toBeVisible()
  await palette.getByPlaceholder('Search music and commands…').fill('E2E Test Song')
  await palette.getByText('E2E Test Song — E2E Test Artist').click()
  await expect(page.getByRole('button', { name: 'Open now playing' })).toBeVisible()

  await page.keyboard.press('Meta+k')
  await palette.getByPlaceholder('Search music and commands…').fill('Settings')
  await palette.getByText('Settings', { exact: true }).click()
  await expect(page).toHaveURL(/\/settings/)

  await page.keyboard.press('Meta+k')
  await expect(palette).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(palette).toBeHidden()
})
