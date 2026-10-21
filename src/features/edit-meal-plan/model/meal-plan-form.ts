import { z } from 'zod'
import { saveRecord } from '@/shared/api'
import { postMessage, type MealPlan } from '@/shared/db'

const macro = (max: number) => z.coerce.number().min(0).max(max)

export const mealPlanSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(40),
  goal: z.object({
    kcal: z.coerce.number().min(1000, 'At least 1,000 kcal').max(6000),
    protein: macro(400),
    carbs: macro(800),
    fat: macro(300),
  }),
  meals: z.array(
    z.object({
      slot: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
      items: z.array(
        z.object({
          foodId: z.string().min(1),
          grams: z.coerce.number().min(1, 'At least 1 g').max(2000),
        }),
      ),
    }),
  ),
})

export type MealPlanFormIn = z.input<typeof mealPlanSchema>
export type MealPlanFormOut = z.output<typeof mealPlanSchema>

export async function assignMealPlan(base: MealPlan, v: MealPlanFormOut) {
  const plan: MealPlan = { ...base, ...v, updatedAt: Date.now() }
  await saveRecord('mealPlans', plan)
  postMessage({ type: 'meal-plan-assigned', planName: plan.name })
}
