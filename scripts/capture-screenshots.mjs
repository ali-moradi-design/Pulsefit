// Captures the install-dialog screenshots from the real app.
// Start `pnpm preview` first, then run `node scripts/capture-screenshots.mjs`.
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL ?? 'http://localhost:4173'
const out = new URL('../public/screenshots/', import.meta.url).pathname
const browser = await chromium.launch({ channel: 'chromium' })

async function shot(path, file, viewport, scale, theme = 'dark', act) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, locale: 'en-US' })
  const page = await ctx.newPage()
  await page.goto(base)
  await page.evaluate((t) => {
    localStorage.setItem('pulsefit-settings', JSON.stringify({ state: { theme: t }, version: 0 }))
    localStorage.setItem('pulsefit-install-dismissed', '1')
  }, theme)
  await page.goto(base + path)
  await page.waitForTimeout(1200)
  if (act) await act(page)
  await page.screenshot({ path: out + file })
  await ctx.close()
}

await shot(
  '/athlete/workout',
  'workout-narrow.png',
  { width: 390, height: 844 },
  2,
  'dark',
  async (page) => {
    await page.getByRole('button', { name: 'Do now' }).nth(1).click()
    await page.getByRole('button', { name: 'Log set 1' }).click()
    await page.waitForTimeout(1500)
  },
)
await shot('/athlete/progress', 'progress-narrow.png', { width: 390, height: 844 }, 2, 'neon')
await shot('/coach/programs', 'coach-wide.png', { width: 1280, height: 800 }, 1, 'light')
await browser.close()
console.log('screenshots written')
