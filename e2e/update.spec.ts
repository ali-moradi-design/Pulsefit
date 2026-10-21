import { readFile, writeFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { waitForServiceWorker } from './helpers'

test('asks before activating a new version, never during a workout', async ({ page }) => {
  await page.goto('/athlete/workout')
  await waitForServiceWorker(page)
  await page.getByRole('button', { name: 'Do now' }).first().click()

  // Change the built service worker, as a new deploy would.
  const file = new URL('../dist/sw.js', import.meta.url)
  const original = await readFile(file, 'utf8')
  await writeFile(file, `${original}\n// next version`)
  try {
    await runUpdate(page)
  } finally {
    await writeFile(file, original)
  }
})

async function runUpdate(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await (await navigator.serviceWorker.getRegistration())?.update()
  })
  await expect
    .poll(() =>
      page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting),
    )
    .toBe(true)

  const prompt = page.getByText('New version available')
  await expect(prompt).toBeHidden()

  // Finish the workout; now the prompt may show.
  while (await page.getByRole('button', { name: 'Next exercise' }).isVisible()) {
    await page.getByRole('button', { name: 'Next exercise' }).click()
  }
  await page.getByRole('button', { name: 'Finish workout' }).click()
  await expect(prompt).toBeVisible()

  const before = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)
  // The new worker takes over and the page reloads once.
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'Update' }).click(),
  ])
  await expect
    .poll(() =>
      page.evaluate(async () => !(await navigator.serviceWorker.getRegistration())?.waiting),
    )
    .toBe(true)
  expect(before).toContain('/sw.js')
  await expect(prompt).toBeHidden()
}
