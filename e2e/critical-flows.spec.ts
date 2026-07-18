import { expect, test } from '@playwright/test'
import path from 'node:path'

const fixture = (name: string) => path.resolve('e2e/fixtures', name)

test('critical music-library flows work in the browser', async ({ page }) => {
  await page.goto('/import')

  const fileChooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Select Files' }).click()
  await (await fileChooser).setFiles([
    fixture('e2e-test-song.mp3'),
    fixture('e2e-up-next.mp3'),
  ])

  await expect(page).toHaveURL(/\/songs/)
  await expect(page.getByText('E2E Test Song', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('E2E Up Next', { exact: true }).first()).toBeVisible()

  // Playback and advancing progress.
  await page.getByText('E2E Test Song', { exact: true }).first().click()
  await expect(page.getByRole('button', { name: 'Open now playing' })).toBeVisible()
  const miniProgress = page.getByRole('slider').first()
  const positionBefore = Number(await miniProgress.getAttribute('aria-valuenow'))
  await expect.poll(
    async () => Number(await miniProgress.getAttribute('aria-valuenow')),
    { timeout: 5_000 },
  ).toBeGreaterThan(positionBefore)

  // Artist and album links use persisted relation IDs rather than raw names.
  await page.getByRole('button', { name: 'E2E Test Artist' }).first().click()
  await expect(page.getByRole('heading', { name: 'E2E Test Artist' })).toBeVisible()
  await page.getByRole('link', { name: 'Songs' }).click()
  await page.getByRole('button', { name: 'E2E Test Album' }).first().click()
  await expect(page.getByRole('heading', { name: 'E2E Test Album' })).toBeVisible()
  await page.getByRole('link', { name: 'Songs' }).click()

  // Now Playing uses the current track and exposes a working scrubber.
  await page.getByRole('button', { name: 'Open now playing' }).click()
  const nowPlaying = page.locator('.fixed.inset-0').last()
  await expect(nowPlaying.getByRole('heading', { name: 'E2E Test Song' })).toBeVisible()
  const nowPlayingProgress = nowPlaying.getByRole('slider').first()
  const seekBefore = Number(await nowPlayingProgress.getAttribute('aria-valuenow'))
  await nowPlayingProgress.press('ArrowRight')
  expect(Number(await nowPlayingProgress.getAttribute('aria-valuenow'))).toBeGreaterThan(seekBefore)
  await nowPlaying.getByRole('button', { name: 'Close now playing' }).click()

  // Queue contains the playing track and the remaining track in order.
  await page.getByRole('button', { name: 'Open queue' }).click()
  const queue = page.getByRole('complementary', { name: 'Queue' })
  await expect(queue.getByText('Now Playing')).toBeVisible()
  await expect(queue.getByRole('heading', { name: 'Up Next' })).toBeVisible()
  await expect(queue.getByText('E2E Up Next', { exact: true })).toBeVisible()
  await queue.getByRole('button', { name: 'Close queue' }).click()

  // Favorite state is persisted and queryable on its dedicated page.
  const songRow = page.locator('.group').filter({ hasText: 'E2E Test Song' }).first()
  await songRow.getByRole('button', { name: 'Add to favorites' }).click()
  await page.getByRole('link', { name: 'Favorites' }).click()
  await expect(page.getByRole('main').getByRole('heading', { name: 'Favorites' })).toBeVisible()
  await expect(page.getByText('E2E Test Song', { exact: true }).first()).toBeVisible()

  // Clearing is destructive only after the dialog's explicit second click.
  await page.getByRole('link', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Clear library' }).click()
  const confirmation = page.getByRole('dialog')
  await expect(confirmation).toContainText('cannot be undone')
  await confirmation.getByRole('button', { name: 'Cancel' }).click()
  await page.getByRole('link', { name: 'Favorites' }).click()
  await expect(page.getByText('E2E Test Song', { exact: true }).first()).toBeVisible()
  await page.getByRole('link', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Clear library' }).click()
  await confirmation.getByRole('button', { name: 'Clear library permanently' }).click()
  await expect(confirmation).toBeHidden()
  await page.getByRole('link', { name: 'Songs' }).click()
  await expect(page.getByRole('heading', { name: 'No songs yet' })).toBeVisible()
})
