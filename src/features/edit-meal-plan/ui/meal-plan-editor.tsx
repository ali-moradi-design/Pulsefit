import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useFoodMap } from '@/entities/library'
import { macrosFor, SLOTS, sumMacros } from '@/entities/nutrition'
import type { MealPlan } from '@/shared/db'
import { Button, Card, Field, Icon } from '@/shared/ui'
import {
  assignMealPlan,
  mealPlanSchema,
  type MealPlanFormIn,
  type MealPlanFormOut,
} from '../model/meal-plan-form'
import { MealEditor } from './meal-editor'

export function MealPlanEditor({ plan, athleteName }: { plan: MealPlan; athleteName: string }) {
  const form = useForm<MealPlanFormIn, unknown, MealPlanFormOut>({
    resolver: zodResolver(mealPlanSchema),
    defaultValues: {
      name: plan.name,
      goal: plan.goal,
      meals: SLOTS.map(({ slot }) => ({
        slot,
        items: plan.meals.find((m) => m.slot === slot)?.items ?? [],
      })),
    },
  })
  const { register, control, handleSubmit, formState } = form
  const meals = useWatch({ control, name: 'meals' })
  const foods = useFoodMap()
  const [saved, setSaved] = useState(false)
  const planned = sumMacros(
    meals.flatMap((m) =>
      m.items.flatMap((it) => {
        const f = foods.get(it.foodId)
        return f ? [macrosFor(f, Number(it.grams) || 0)] : []
      }),
    ),
  )
  const e = formState.errors

  return (
    <FormProvider {...form}>
      <form
        noValidate
        className="flex flex-col gap-3"
        onChange={() => setSaved(false)}
        onSubmit={handleSubmit(async (v) => {
          await assignMealPlan(plan, v)
          setSaved(true)
        })}
      >
        <Field label="Plan name" error={e.name?.message} {...register('name')} />
        <div className="grid grid-cols-4 gap-2">
          <Field
            label="kcal"
            inputMode="numeric"
            error={e.goal?.kcal?.message}
            {...register('goal.kcal')}
          />
          <Field label="Protein" inputMode="numeric" {...register('goal.protein')} />
          <Field label="Carbs" inputMode="numeric" {...register('goal.carbs')} />
          <Field label="Fat" inputMode="numeric" {...register('goal.fat')} />
        </div>
        <p className="-mt-1 text-xs text-muted">Daily goals; macros in grams.</p>
        <p className="text-sm text-muted tabular">
          Planned meals: {planned.kcal.toLocaleString('en')} kcal · P {Math.round(planned.protein)}{' '}
          g · C {Math.round(planned.carbs)} g · F {Math.round(planned.fat)} g
        </p>
        <Card className="px-4 py-1">
          <ul className="divide-y divide-border">
            {SLOTS.map((s, i) => (
              <MealEditor key={s.slot} index={i} label={s.label} />
            ))}
          </ul>
        </Card>
        <Button type="submit" block disabled={formState.isSubmitting}>
          <Icon name="send" />
          Assign to {athleteName}
        </Button>
        {saved && (
          <p role="status" className="text-center text-sm font-semibold text-ok">
            Assigned. {athleteName}’s diet page uses the new plan.
          </p>
        )}
      </form>
    </FormProvider>
  )
}
