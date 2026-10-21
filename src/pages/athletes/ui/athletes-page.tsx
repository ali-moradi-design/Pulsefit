import { useMemo } from 'react'
import { useBodyLogs, useStreak } from '@/entities/body'
import { sumMacros, useMealLogs, useMealPlan } from '@/entities/nutrition'
import { useWorkoutLogs } from '@/entities/training'
import { SendNoteForm } from '@/features/send-note'
import { SyncChip } from '@/features/sync-status'
import { addDays, toDateKey } from '@/shared/lib'
import { Card, LineChart, ProgressBar } from '@/shared/ui'

const dayLabel = new Intl.DateTimeFormat('en', { weekday: 'short', day: 'numeric', month: 'short' })

export function AthletesPage() {
  const workouts = useWorkoutLogs()
  const body = useBodyLogs()
  const meals = useMealLogs()
  const plan = useMealPlan()
  const streak = useStreak()
  const weekAgo = toDateKey(addDays(new Date(), -7))
  const thisWeek = workouts.filter((w) => w.date > weekAgo && w.finishedAt).length
  const eaten = sumMacros(meals.map((m) => m.macros)).kcal
  const recent = [...workouts].reverse().slice(0, 5)
  const chart = useMemo(
    () => ({
      x: body.map((b) => new Date(`${b.date}T12:00:00`).getTime() / 1000),
      y: body.map((b) => b.weightKg),
    }),
    [body],
  )

  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h1 id="page-title" className="text-2xl font-bold">
          Athletes
        </h1>
        <SyncChip />
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-accent-soft font-display font-bold text-accent">
            SK
          </span>
          <div>
            <b>Sam K.</b>
            <p className="text-xs text-muted">
              {streak}-day streak · {thisWeek} workouts in the last 7 days
            </p>
          </div>
        </div>
        {plan && (
          <div>
            <div className="flex justify-between text-xs">
              <span>Calories today</span>
              <span className="text-muted tabular">
                {eaten.toLocaleString('en')} / {plan.goal.kcal.toLocaleString('en')} kcal
              </span>
            </div>
            <ProgressBar label="Calories today" value={eaten} max={plan.goal.kcal} />
          </div>
        )}
        <LineChart x={chart.x} y={chart.y} label="Sam’s body weight" unit="kg" height={140} />
      </Card>

      <Card className="py-2">
        <h2 className="pt-1 text-lg font-bold">Recent workouts</h2>
        <ul className="divide-y divide-border">
          {recent.map((w) => {
            const volume = w.sets.reduce((v, s) => v + s.weightKg * s.reps, 0)
            return (
              <li key={w.id} className="flex justify-between gap-2 py-2.5 text-sm">
                <span>
                  <b>{w.dayTitle}</b>
                  <span className="block text-xs text-muted">
                    {dayLabel.format(new Date(`${w.date}T12:00:00`))}
                  </span>
                </span>
                <span className="text-right text-xs text-muted tabular">
                  {w.sets.length} sets · {Math.round(volume).toLocaleString('en')} kg
                  <span className="block">{w.finishedAt ? 'Finished' : 'In progress'}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

      <SendNoteForm athleteName="Sam" />
    </section>
  )
}
