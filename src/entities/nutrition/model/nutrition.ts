import { useLiveQuery } from 'dexie-react-hooks'
import { DEMO_PLAN_ID } from '@/shared/api'
import { db, type Food, type Macros, type MealLog, type MealPlan, type MealSlot } from '@/shared/db'
import { toDateKey } from '@/shared/lib'

export const SLOTS: ReadonlyArray<{ slot: MealSlot; label: string }> = [
  { slot: 'breakfast', label: 'Breakfast' },
  { slot: 'lunch', label: 'Lunch' },
  { slot: 'snack', label: 'Snack' },
  { slot: 'dinner', label: 'Dinner' },
]

export const zeroMacros = (): Macros => ({ kcal: 0, protein: 0, carbs: 0, fat: 0 })

export function macrosFor(food: Food, grams: number): Macros {
  const f = grams / 100
  return {
    kcal: Math.round(food.per100g.kcal * f),
    protein: Math.round(food.per100g.protein * f * 10) / 10,
    carbs: Math.round(food.per100g.carbs * f * 10) / 10,
    fat: Math.round(food.per100g.fat * f * 10) / 10,
  }
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (a, m) => ({
      kcal: a.kcal + m.kcal,
      protein: a.protein + m.protein,
      carbs: a.carbs + m.carbs,
      fat: a.fat + m.fat,
    }),
    zeroMacros(),
  )
}

export function useMealPlan(): MealPlan | undefined {
  return useLiveQuery(() => db.mealPlans.get(DEMO_PLAN_ID), [])
}

export function useMealLogs(date = toDateKey()): MealLog[] {
  return useLiveQuery(() => db.mealLogs.where('date').equals(date).sortBy('loggedAt'), [date], [])
}
