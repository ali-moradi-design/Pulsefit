import { macrosFor } from '@/entities/nutrition'
import { deleteRecord, saveRecord } from '@/shared/api'
import type { Food, MealPlan, MealSlot } from '@/shared/db'
import { newId, toDateKey } from '@/shared/lib'

export function logFood(food: Food, grams: number, slot: MealSlot) {
  return saveRecord('mealLogs', {
    id: newId(),
    date: toDateKey(),
    slot,
    foodId: food.id,
    grams,
    macros: macrosFor(food, grams),
    loggedAt: Date.now(),
  })
}

export async function logPlannedMeal(plan: MealPlan, slot: MealSlot, foods: Map<string, Food>) {
  const meal = plan.meals.find((m) => m.slot === slot)
  for (const it of meal?.items ?? []) {
    const food = foods.get(it.foodId)
    if (food) await logFood(food, it.grams, slot)
  }
}

export const removeMealLog = (id: string) => deleteRecord('mealLogs', id)

/** Suggests a slot from the time of day. */
export function slotForNow(d = new Date()): MealSlot {
  const h = d.getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 18) return 'snack'
  return 'dinner'
}
