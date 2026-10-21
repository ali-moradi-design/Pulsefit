import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useExerciseMap, useExercises } from '@/entities/library'
import { Icon, PickerSheet } from '@/shared/ui'
import type { ProgramFormIn } from '../model/program-form'

const num = 'h-8 w-12 rounded-lg bg-surface-2 text-center text-sm font-semibold tabular text-text'

export function DayEditor({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { control, register, formState } = useFormContext<ProgramFormIn>()
  const { fields, append, remove, move } = useFieldArray({ control, name: `days.${index}.items` })
  const exercises = useExercises()
  const map = useExerciseMap()
  const [picking, setPicking] = useState(false)
  const errors = formState.errors.days?.[index]

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 pt-2.5">
        <input
          aria-label="Day name"
          className="min-w-0 flex-1 bg-transparent font-display font-bold outline-none"
          {...register(`days.${index}.title`)}
        />
        <span className="text-xs text-muted">{fields.length} exercises</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Make this a rest day"
          className="p-1 text-muted"
        >
          <Icon name="trash" size={18} />
        </button>
      </div>
      {errors?.title && <p className="text-xs text-accent">{errors.title.message}</p>}
      <ul className="divide-y divide-border">
        {fields.map((f, i) => {
          const name = map.get(f.exerciseId)?.name ?? f.exerciseId
          return (
            <li key={f.id} className="flex flex-col gap-1.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <b className="text-sm">{name}</b>
                <div className="flex text-muted">
                  <button
                    type="button"
                    aria-label={`Move ${name} up`}
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                    className="p-1 disabled:opacity-30"
                  >
                    <Icon name="back" size={16} className="rotate-90" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${name} down`}
                    disabled={i === fields.length - 1}
                    onClick={() => move(i, i + 1)}
                    className="p-1 disabled:opacity-30"
                  >
                    <Icon name="back" size={16} className="-rotate-90" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    onClick={() => remove(i)}
                    className="p-1"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <label className="flex items-center gap-1">
                  <input
                    aria-label={`${name} sets`}
                    inputMode="numeric"
                    className={num}
                    {...register(`days.${index}.items.${i}.sets`)}
                  />
                  sets
                </label>
                <label className="flex items-center gap-1">
                  ×
                  <input
                    aria-label={`${name} reps`}
                    inputMode="numeric"
                    className={num}
                    {...register(`days.${index}.items.${i}.reps`)}
                  />
                  reps
                </label>
                <label className="flex items-center gap-1">
                  <input
                    aria-label={`${name} weight in kg`}
                    inputMode="decimal"
                    className={num}
                    {...register(`days.${index}.items.${i}.weightKg`)}
                  />
                  kg
                </label>
                <label className="flex items-center gap-1">
                  rest
                  <input
                    aria-label={`${name} rest in seconds`}
                    inputMode="numeric"
                    className={num}
                    {...register(`days.${index}.items.${i}.restSec`)}
                  />
                  s
                </label>
              </div>
            </li>
          )
        })}
      </ul>
      {errors?.items?.root && <p className="text-xs text-accent">{errors.items.root.message}</p>}
      {errors?.items?.message && <p className="text-xs text-accent">{errors.items.message}</p>}
      <button
        type="button"
        onClick={() => setPicking(true)}
        className="flex items-center gap-2 py-2.5 font-semibold text-accent"
      >
        <Icon name="plus" />
        Add from library
      </button>
      {picking && (
        <PickerSheet
          title="Add exercise"
          items={exercises.map((e) => ({
            id: e.id,
            label: e.name,
            sub: `${e.muscle} · ${e.equipment}`,
          }))}
          onClose={() => setPicking(false)}
          onPick={(id) => {
            append({ exerciseId: id, sets: 3, reps: 10, weightKg: 0, restSec: 90 })
            setPicking(false)
          }}
        />
      )}
    </div>
  )
}
