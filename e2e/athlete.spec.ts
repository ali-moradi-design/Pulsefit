import { expect, test } from '@playwright/test'

test('logs a set and runs the rest timer', async ({ page }) => {
  await page.goto('/athlete/workout')
  await page.getByRole('button', { name: 'Do now' }).first().click()
  await page.getByRole('button', { name: 'Log set 1' }).click()
  await expect(page.getByRole('button', { name: 'Log set 1' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('timer')).toBeVisible()
  await page.getByRole('button', { name: '+15 s' }).click()
  await page.getByRole('button', { name: 'Skip rest' }).click()
  await expect(page.getByRole('timer')).toBeHidden()

  // A reload in the middle of a workout resumes it.
  await page.reload()
  await expect(page.getByRole('button', { name: 'Log set 1' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('logs a planned meal and a food found by barcode', async ({ page }) => {
  await page.goto('/athlete/diet')
  await expect(page.getByText('2,200', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Log planned' }).first().click()
  await expect(page.getByText('2,200', { exact: true })).toBeHidden()

  await page.getByRole('button', { name: 'Scan' }).click()
  await page.getByLabel('Barcode', { exact: true }).fill('2000000000015')
  await page.getByRole('button', { name: 'Find' }).click()
  await expect(page.getByRole('heading', { name: 'Egg, whole, hard-boiled' })).toBeVisible()
  await page.getByRole('button', { name: /^Add to/ }).click()
  await expect(page.getByText(/Egg, whole, hard-boiled · 50 g · 78 kcal/)).toBeVisible()
})

test('shows progress with the weight chart and records', async ({ page }) => {
  await page.goto('/athlete/progress')
  await expect(page.getByRole('img', { name: /Body weight chart/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Personal records' })).toBeVisible()
})
