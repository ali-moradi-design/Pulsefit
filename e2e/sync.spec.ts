import { expect, test } from '@playwright/test'

test('queues changes offline and syncs them to the mock API when back online', async ({
  page,
  context,
}) => {
  await page.goto('/athlete/progress')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  const status = page.getByTestId('sync-status')
  await expect(status).toHaveText('All changes synced')

  await context.setOffline(true)
  await page.getByLabel('Weight (kg)').fill('80.4')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(status).toHaveText('Offline · 1 change queued')

  await context.setOffline(false)
  await expect(status).toHaveText('All changes synced', { timeout: 15_000 })

  const server = await page.evaluate(() => fetch('/api/status').then((r) => r.json()))
  expect(server).toMatchObject({ simulated: true })
  expect(server.received).toBeGreaterThanOrEqual(1)
})
