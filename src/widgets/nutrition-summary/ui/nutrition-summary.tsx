import { sumMacros, useMealLogs, useMealPlan } from '@/entities/nutrition'
import { Card, ProgressBar, Ring } from '@/shared/ui'

const fmt = (n: number) => Math.round(n).toLocaleString('en')

/** Today's calories and macros against the coach's plan. */
export function NutritionSummary({ variant }: { variant: 'ring' | 'bar' }) {
  const plan = useMealPlan()
  const logs = useMealLogs()
  if (!plan) return null
  const eaten = sumMacros(logs.map((l) => l.macros))
  const goal = plan.goal
  const macros = [
    { label: 'Protein', color: 'var(--protein)', v: eaten.protein, g: goal.protein },
    { label: 'Carbs', color: 'var(--carbs)', v: eaten.carbs, g: goal.carbs },
    { label: 'Fat', color: 'var(--fat)', v: eaten.fat, g: goal.fat },
  ]

  if (variant === 'bar') {
    return (
      <Card className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <p>
            <b className="font-display text-[26px] tabular">
              {fmt(Math.max(0, goal.kcal - eaten.kcal))}
            </b>{' '}
            <span className="text-sm text-muted">kcal left</span>
          </p>
          <span className="text-sm text-muted tabular">
            {fmt(eaten.kcal)} eaten · {fmt(goal.kcal)} goal
          </span>
        </div>
        <ProgressBar label="Calories eaten" value={eaten.kcal} max={goal.kcal} height={10} />
        <div className="flex justify-between text-xs">
          {macros.map((m) => (
            <span key={m.label}>
              <b style={{ color: m.color }} aria-hidden="true">
                ●
              </b>{' '}
              {m.label} {fmt(m.v)} g
            </span>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex items-center gap-4">
      <Ring value={eaten.kcal} max={goal.kcal} size={118}>
        <b className="font-display text-[22px] tabular">{fmt(eaten.kcal)}</b>
        <span className="text-xs text-muted">/ {fmt(goal.kcal)} kcal</span>
      </Ring>
      <div className="flex flex-1 flex-col gap-2.5">
        {macros.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-xs">
              <span>{m.label}</span>
              <span className="text-muted tabular">
                {fmt(m.v)} / {m.g} g
              </span>
            </div>
            <ProgressBar label={m.label} value={m.v} max={m.g} color={m.color} />
          </div>
        ))}
      </div>
    </Card>
  )
}
