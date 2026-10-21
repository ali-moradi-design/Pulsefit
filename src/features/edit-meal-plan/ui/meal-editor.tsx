import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useFoodMap, useFoods } from '@/entities/library'
import { macrosFor } from '@/entities/nutrition'
import { Icon, PickerSheet } from '@/shared/ui'
import type { MealPlanFormIn } from '../model/meal-plan-form'

export function MealEditor({ index, label }: { index: number; label: string }) {
  const { control, register } = useFormContext<MealPlanFormIn>()
  const { fields, append, remove } = useFieldArray({ control, name: `meals.${index}.items` })
  const foods = useFoods()
  const map = useFoodMap()
  const [picking, setPicking] = useState(false)

  return (
    <li className="py-2.5">
      <div className="flex items-center justify-between">
        <b>{label}</b>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="flex items-center gap-1 text-sm font-semibold text-accent"
        >
          <Icon name="plus" size={16} />
          Add food
        </button>
      </div>
      <ul className="mt-1 flex flex-col gap-1.5">
        {fields.map((f, i) => {
          const name = map.get(f.foodId)?.name ?? f.foodId
          return (
            <li key={f.id} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-muted">{name}</span>
              <input
                aria-label={`${name} grams in ${label}`}
                inputMode="numeric"
                className="h-8 w-16 rounded-lg bg-surface-2 text-center font-semibold tabular"
                {...register(`meals.${index}.items.${i}.grams`)}
              />
              <span className="text-xs text-muted">g</span>
              <button
                type="button"
                aria-label={`Remove ${name} from ${label}`}
                onClick={() => remove(i)}
                className="p-1 text-muted"
              >
                <Icon name="close" size={16} />
              </button>
            </li>
          )
        })}
      </ul>
      {picking && (
        <PickerSheet
          title={`Add to ${label}`}
          items={foods.map((f) => ({
            id: f.id,
            label: f.name,
            sub: `${f.serving.label} · ${macrosFor(f, f.serving.grams).kcal} kcal`,
          }))}
          onClose={() => setPicking(false)}
          onPick={(id) => {
            append({ foodId: id, grams: map.get(id)?.serving.grams ?? 100 })
            setPicking(false)
          }}
        />
      )}
    </li>
  )
}
