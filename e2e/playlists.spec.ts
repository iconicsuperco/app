import { expect, test } from '@playwright/test'
import path from 'node:path'

const fixture = (name: string) => path.resolve('e2e/fixtures', name)

test('playlists can be created, populated from a track menu, emptied, and deleted', async ({
  page,
}) => {
  await page.goto('/import')

  const fileChooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Select Files' }).click()
  await (await fileChooser).setFiles(fixture('e2e-test-song.mp3'))
  await expect(page).toHaveURL(/\/songs/)
  await expect(page.getByText('E2E Test Song', { exact: true }).first()).toBeVisible()

  await page.getByRole('link', { name: 'Playlists' }).click()
  await page.getByRole('button', { name: 'New Playlist' }).click()
  const createDialog = page.getByRole('dialog')
  await createDialog.getByLabel('Playlist name').fill('E2E Playlist')
  await createDialog.getByRole('button', { name: 'Create playlist' }).click()
  await expect(page).toHaveURL(/\/playlist\//)
  await expect(page.getByRole('heading', { name: 'E2E Playlist' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'No tracks in this playlist' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Songs' }).click()
  const song = page.getByText('E2E Test Song', { exact: true }).first()
  await song.click({ button: 'right' })
  const menu = page.getByRole('menu')
  await menu.getByRole('menuitem', { name: 'Add to playlist' }).click()
  const addDialog = page.getByRole('dialog')
  await addDialog.getByRole('button', { name: 'E2E Playlist' }).click()
  await expect(addDialog).toBeHidden()

  await page.getByRole('link', { name: 'Playlists' }).click()
  await page.getByText('E2E Playlist', { exact: true }).click()
  await expect(page.getByText('E2E Test Song', { exact: true }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Remove E2E Test Song from playlist' }).click()
  await expect(
    page.getByRole('heading', { name: 'No tracks in this playlist' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Delete playlist' }).click()
  const deleteDialog = page.getByRole('dialog')
  await expect(deleteDialog).toContainText('permanently deletes the playlist')
  await deleteDialog.getByRole('button', { name: 'Delete playlist' }).click()
  await expect(page).toHaveURL(/\/playlists/)
  await expect(page.getByRole('heading', { name: 'No playlists yet' })).toBeVisible()
})
