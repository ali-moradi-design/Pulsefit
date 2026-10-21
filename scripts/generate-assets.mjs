// Renders the PWA icons and install screenshots with Playwright.
// Run after `pnpm build` is not needed: `node scripts/generate-assets.mjs`.
import { chromium } from '@playwright/test'
import { copyFile } from 'node:fs/promises'

const pulse = (stroke) =>
  `<path d="M8 34h12l6-16 12 30 6-14h12" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`

const icon = (size, { maskable = false } = {}) => {
  const inner = maskable ? 0.62 : 0.78
  const offset = (64 * (1 - inner)) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="${maskable ? 0 : 14}" fill="#0f1522"/>
    <g transform="translate(${offset} ${offset}) scale(${inner})">${pulse('#3ee0a1')}</g>
  </svg>`
}

const out = new URL('../public/', import.meta.url).pathname
const browser = await chromium.launch()
const page = await browser.newPage()

const targets = [
  ['icons/icon-192.png', icon(192)],
  ['icons/icon-512.png', icon(512)],
  ['icons/maskable-512.png', icon(512, { maskable: true })],
  ['icons/apple-touch-icon.png', icon(180, { maskable: true })],
  ['icons/shortcut-workout.png', icon(96)],
]
for (const [file, svg] of targets) {
  const size = Number(svg.match(/width="(\d+)"/)[1])
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<body style="margin:0">${svg}</body>`)
  await page.screenshot({ path: out + file, omitBackground: true })
}
await browser.close()

// Install dialog screenshots come from the approved mockups.
const mockups = new URL('../docs/mockups/', import.meta.url).pathname
await copyFile(mockups + 'dark-today.png', out + 'screenshots/today-narrow.png')
await copyFile(mockups + 'dark-workout.png', out + 'screenshots/workout-narrow.png')
await copyFile(mockups + 'overview-dark.png', out + 'screenshots/overview-wide.png')
console.log('assets written')
