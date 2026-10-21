import { expect, test } from '@playwright/test'
import { waitForServiceWorker } from './helpers'

const shown = (page: import('@playwright/test').Page) =>
  page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready
    return (await reg.getNotifications()).map((n) => ({ title: n.title, tag: n.tag }))
  })

test('coach note becomes a service worker notification in the athlete tab', async ({ context }) => {
  await context.grantPermissions(['notifications'])
  const athlete = await context.newPage()
  await athlete.goto('/athlete')
  await waitForServiceWorker(athlete)
  const coach = await context.newPage()
  await coach.goto('/coach')
  await coach.getByLabel('Note to Sam').fill('Sleep 8 hours tonight.')
  await coach.getByRole('button', { name: 'Send note' }).click()

  await expect(athlete.getByText('New note from Coach Lee: Sleep 8 hours tonight.')).toBeVisible()
  await expect
    .poll(() => shown(athlete))
    .toEqual(
      expect.arrayContaining([expect.objectContaining({ title: 'New note from Coach Lee' })]),
    )
})

test('status page lists capabilities and sends a test notification', async ({ page, context }) => {
  await context.grantPermissions(['notifications'])
  await page.goto('/status')
  await waitForServiceWorker(page)
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Service worker: supported' }),
  ).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'IndexedDB: supported' })).toBeVisible()
  await expect(page.getByTestId('server-status')).toContainText('server received')
  await page.getByRole('button', { name: 'Test notification' }).click()
  await expect
    .poll(() => shown(page))
    .toEqual(expect.arrayContaining([expect.objectContaining({ tag: 'test' })]))
})
