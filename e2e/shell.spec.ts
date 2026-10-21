import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('opens the athlete today page and switches role', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/athlete$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('radio', { name: 'Coach' }).click()
  await expect(page).toHaveURL(/\/coach$/)
  await expect(page.getByRole('link', { name: 'Library' })).toBeVisible()
})

for (const theme of ['light', 'dark', 'neon'] as const) {
  test(`has no axe violations in the ${theme} theme`, async ({ page }) => {
    await page.goto('/status')
    await page.getByRole('radio', { name: theme[0]!.toUpperCase() + theme.slice(1) }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations).toEqual([])
  })
}
