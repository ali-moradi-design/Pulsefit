import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { WEEKDAYS } from '@/entities/training'
import type { Program } from '@/shared/db'
import { cn } from '@/shared/lib'
import { Button, Card, Field, Icon } from '@/shared/ui'
import {
  assignProgram,
  programSchema,
  toForm,
  type ProgramFormIn,
  type ProgramFormOut,
} from '../model/program-form'
import { DayEditor } from './day-editor'

const ORDER = [1, 2, 3, 4, 5, 6, 0]

export function ProgramEditor({ program, athleteName }: { program: Program; athleteName: string }) {
  const form = useForm<ProgramFormIn, unknown, ProgramFormOut>({
    resolver: zodResolver(programSchema),
    defaultValues: toForm(program),
  })
  const { register, control, handleSubmit, reset, formState } = form
  const days = useFieldArray({ control, name: 'days' })
  const weekdays = useWatch({ control, name: 'days' }).map((d) => d.weekday)
  const [selected, setSelected] = useState(() => weekdays[0] ?? 1)
  const [saved, setSaved] = useState(false)
  const dayIndex = weekdays.indexOf(selected)

  const onSubmit = async (v: ProgramFormOut) => {
    await assignProgram(program, v)
    reset({ ...v, note: '' })
    setSaved(true)
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-3"
        onChange={() => setSaved(false)}
      >
        <div className="flex gap-2">
          <Field
            label="Name"
            className="flex-[2]"
            error={formState.errors.name?.message}
            {...register('name')}
          />
          <Field label="Weeks" inputMode="numeric" className="flex-1" {...register('weeks')} />
        </div>

        <div role="tablist" aria-label="Weekday" className="flex gap-1.5">
          {ORDER.map((wd) => {
            const active = wd === selected
            const training = weekdays.includes(wd)
            return (
              <button
                key={wd}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(wd)}
                className={cn(
                  'flex-1 rounded-xl border py-2 text-xs font-semibold',
                  active
                    ? 'border-transparent bg-accent text-on-accent shadow-glow'
                    : 'border-border bg-surface text-muted',
                  !active && !training && 'opacity-60',
                )}
              >
                {WEEKDAYS[wd]}
                <span className="sr-only">{training ? ', training day' : ', rest day'}</span>
              </button>
            )
          })}
        </div>

        <Card className="px-3.5 py-1.5">
          {dayIndex >= 0 ? (
            <DayEditor
              key={days.fields[dayIndex]?.id}
              index={dayIndex}
              onRemove={() => days.remove(dayIndex)}
            />
          ) : (
            <div className="flex items-center justify-between py-3">
              <p className="text-muted">{WEEKDAYS[selected]} is a rest day.</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  days.append({
                    weekday: selected,
                    title: `${WEEKDAYS[selected]} session`,
                    items: [],
                  })
                }
              >
                <Icon name="plus" />
                Add training day
              </Button>
            </div>
          )}
        </Card>
        {formState.errors.days?.root && (
          <p className="text-sm text-accent">{formState.errors.days.root.message}</p>
        )}
        {formState.errors.days &&
          !formState.errors.days.root &&
          dayIndex >= 0 &&
          !formState.errors.days[dayIndex] && (
            <p className="text-sm text-accent">
              Another day has a problem; check the highlighted weekdays.
            </p>
          )}

        <label className="flex flex-col gap-1 rounded-2xl border border-border bg-surface px-3.5 py-2">
          <span className="text-[11px] font-semibold tracking-[.06em] text-muted uppercase">
            Note to athlete (optional)
          </span>
          <textarea
            rows={2}
            className="resize-none bg-transparent outline-none"
            placeholder="Add 2.5 kg to bench if all sets felt easy…"
            {...register('note')}
          />
        </label>

        <Button type="submit" block disabled={formState.isSubmitting}>
          <Icon name="send" />
          Assign to {athleteName}
        </Button>
        {saved && (
          <p role="status" className="text-center text-sm font-semibold text-ok">
            Assigned. {athleteName}’s app has the new program.
          </p>
        )}
      </form>
    </FormProvider>
  )
}
