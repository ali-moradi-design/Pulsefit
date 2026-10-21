import { expect, test } from '@playwright/test'

test('serves a complete web app manifest', async ({ page, request }) => {
  await page.goto('/')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBeTruthy()
  const manifest = await (await request.get(href!)).json()
  expect(manifest).toMatchObject({ name: 'Pulsefit', display: 'standalone', start_url: '/athlete' })
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true)
  expect(manifest.screenshots.map((s: { form_factor: string }) => s.form_factor)).toEqual(
    expect.arrayContaining(['narrow', 'wide']),
  )
  expect(manifest.shortcuts[0].name).toBe('Start workout')
})

test('works offline after the first visit', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  // The first visit is not controlled yet; reload so the worker serves the page.
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)

  await context.setOffline(true)
  await page.goto('/coach/library')
  await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible()
  await context.setOffline(false)
})
