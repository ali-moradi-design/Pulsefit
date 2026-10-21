import { useMemo } from 'react'
import { useBodyLogs, useStreak } from '@/entities/body'
import { useExerciseMap } from '@/entities/library'
import { personalRecords, useWorkoutLogs } from '@/entities/training'
import { LogWeightForm } from '@/features/log-weight'
import { SyncChip } from '@/features/sync-status'
import { Card, LineChart } from '@/shared/ui'

export function ProgressPage() {
  const body = useBodyLogs()
  const workouts = useWorkoutLogs()
  const exercises = useExerciseMap()
  const streak = useStreak()

  const chart = useMemo(
    () => ({
      x: body.map((b) => new Date(`${b.date}T12:00:00`).getTime() / 1000),
      y: body.map((b) => b.weightKg),
    }),
    [body],
  )
  const prs = [...personalRecords(workouts)]
    .sort((a, b) => b[1].weightKg - a[1].weightKg)
    .slice(0, 6)
  const first = body[0]?.weightKg
  const last = body.at(-1)?.weightKg
  const done = workouts.filter((w) => w.finishedAt).length

  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h1 id="page-title" className="text-[26px] font-bold">
          Progress
        </h1>
        <SyncChip />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Streak', value: `${streak} d` },
          { label: 'Workouts', value: String(done) },
          {
            label: 'Weight change',
            value:
              first != null && last != null
                ? `${(last - first > 0 ? '+' : '') + (last - first).toFixed(1)} kg`
                : '–',
          },
        ].map((s) => (
          <Card key={s.label} className="p-3">
            <p className="text-xs text-muted">{s.label}</p>
            <b className="font-display text-xl tabular">{s.value}</b>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Body weight</h2>
          <span className="text-sm text-muted tabular">{last != null ? `${last} kg` : ''}</span>
        </div>
        <LineChart x={chart.x} y={chart.y} label="Body weight" unit="kg" />
      </Card>

      <LogWeightForm />

      <Card className="py-2">
        <h2 className="pt-1 text-lg font-bold">Personal records</h2>
        <ul className="divide-y divide-border">
          {prs.map(([id, pr]) => (
            <li key={id} className="flex justify-between py-2.5 text-sm">
              <span>{exercises.get(id)?.name ?? id}</span>
              <b className="tabular">
                {pr.weightKg} kg × {pr.reps}
              </b>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  )
}
