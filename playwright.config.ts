import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chromium',
      testIgnore: /update\.spec\.ts/,
      // The new headless mode supports notifications; the headless shell does not.
      use: { ...devices['Pixel 7'], channel: 'chromium', locale: 'en-US' },
    },
    {
      // Changes dist/sw.js like a deploy would, so it runs alone after the rest.
      name: 'update',
      testMatch: /update\.spec\.ts/,
      dependencies: ['mobile-chromium'],
      use: { ...devices['Pixel 7'], channel: 'chromium', locale: 'en-US' },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
