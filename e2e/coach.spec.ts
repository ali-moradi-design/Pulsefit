import { expect, test } from '@playwright/test'

test('coach edits and assigns a program; the athlete tab is told live', async ({ context }) => {
  const athlete = await context.newPage()
  await athlete.goto('/athlete')
  const coach = await context.newPage()
  await coach.goto('/coach/programs')

  await coach.getByRole('tab', { name: /^Mon/ }).click()
  await coach.getByLabel('Back squat sets').fill('5')
  await coach.getByRole('button', { name: 'Add from library' }).click()
  await coach.getByRole('button', { name: /Plank/ }).click()
  await coach.getByLabel('Note to athlete (optional)').fill('Five sets of squats this week.')
  await coach.getByRole('button', { name: 'Assign to Sam' }).click()
  await expect(coach.getByText('Assigned.', { exact: false })).toBeVisible()

  await expect(athlete.getByText('Coach Lee updated your program: Strength base')).toBeVisible()
  await expect(athlete.getByText('Five sets of squats this week.').first()).toBeVisible()

  await athlete.goto('/athlete/workout')
  await expect(athlete.getByText('Mon · Lower body A')).toBeVisible()
  await expect(athlete.getByText('5 exercises · ~', { exact: false }).first()).toBeVisible()
})

test('coach validates the meal plan and sends a note', async ({ page }) => {
  await page.goto('/coach/meal-plans')
  await page.getByLabel('kcal').fill('500')
  await page.getByRole('button', { name: 'Assign to Sam' }).click()
  await expect(page.getByText('At least 1,000 kcal')).toBeVisible()
  await page.getByLabel('kcal').fill('2300')
  await page.getByRole('button', { name: 'Assign to Sam' }).click()
  await expect(page.getByText('Assigned.', { exact: false })).toBeVisible()

  await page.goto('/coach')
  await page.getByLabel('Note to Sam').fill('Great week!')
  await page.getByRole('button', { name: 'Send note' }).click()
  await expect(page.getByText('Sent.')).toBeVisible()
  await page.goto('/athlete')
  await expect(page.getByText('Great week!')).toBeVisible()
})

test('coach adds a custom exercise to the library', async ({ page }) => {
  await page.goto('/coach/library')
  await page.getByRole('button', { name: 'New' }).click()
  await page.getByLabel('Name').fill('Hip thrust')
  await page.getByLabel('Equipment').fill('barbell')
  await page.getByRole('button', { name: 'Save exercise' }).click()
  await expect(page.getByText('Hip thrust')).toBeVisible()
})
