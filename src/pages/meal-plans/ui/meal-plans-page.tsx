import { useMealPlan } from '@/entities/nutrition'
import { MealPlanEditor } from '@/features/edit-meal-plan'

export function MealPlansPage() {
  const plan = useMealPlan()
  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <h1 id="page-title" className="text-2xl font-bold">
        Meal plan
      </h1>
      {plan && <MealPlanEditor key={plan.id} plan={plan} athleteName="Sam" />}
    </section>
  )
}
