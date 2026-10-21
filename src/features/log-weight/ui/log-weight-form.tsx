import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { saveRecord } from '@/shared/api'
import { toDateKey } from '@/shared/lib'
import { Button, Card } from '@/shared/ui'

const schema = z.object({
  weightKg: z.coerce.number().min(30, 'Too low').max(300, 'Too high'),
  waistCm: z.union([z.literal(''), z.coerce.number().min(40).max(200)]).optional(),
})

type FormIn = z.input<typeof schema>
type FormOut = z.output<typeof schema>

export function LogWeightForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormIn, unknown, FormOut>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: FormOut) => {
    const date = toDateKey()
    await saveRecord('bodyLogs', {
      id: `body-${date}`,
      date,
      weightKg: v.weightKg,
      waistCm: v.waistCm === '' ? undefined : v.waistCm,
    })
    reset()
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
        <h2 className="text-lg font-bold">Log today’s measurements</h2>
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-muted">
            Weight (kg)
            <input
              inputMode="decimal"
              className="h-11 rounded-xl bg-surface-2 px-3 text-base text-text"
              aria-invalid={!!errors.weightKg}
              {...register('weightKg')}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-muted">
            Waist (cm, optional)
            <input
              inputMode="decimal"
              className="h-11 rounded-xl bg-surface-2 px-3 text-base text-text"
              {...register('waistCm')}
            />
          </label>
        </div>
        {errors.weightKg && (
          <p role="alert" className="text-sm text-accent">
            Weight: {errors.weightKg.message}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          Save
        </Button>
      </form>
    </Card>
  )
}
