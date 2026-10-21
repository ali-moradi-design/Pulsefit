import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Field } from '@/shared/ui'
import { addExercise, exerciseSchema, type ExerciseForm } from '../model/add-exercise'

const MUSCLES = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core'] as const

export function AddExerciseForm({ onDone }: { onDone: () => void }) {
  const { register, handleSubmit, formState } = useForm<ExerciseForm>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: '', muscle: 'legs', equipment: '', cue: '' },
  })
  const e = formState.errors
  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={handleSubmit(async (v) => {
        await addExercise(v)
        onDone()
      })}
    >
      <Field label="Name" error={e.name?.message} {...register('name')} />
      <div className="flex gap-2">
        <label className="flex min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-border bg-surface px-3.5 py-2">
          <span className="text-[11px] font-semibold tracking-[.06em] text-muted uppercase">
            Muscle
          </span>
          <select
            className="bg-transparent font-semibold text-text outline-none"
            {...register('muscle')}
          >
            {MUSCLES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Equipment"
          className="flex-1"
          error={e.equipment?.message}
          {...register('equipment')}
        />
      </div>
      <Field label="Coaching cue" {...register('cue')} />
      <Button type="submit" disabled={formState.isSubmitting}>
        Save exercise
      </Button>
    </form>
  )
}
