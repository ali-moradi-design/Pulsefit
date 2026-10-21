import { useState } from 'react'
import type { LoggedSet } from '@/shared/db'
import { cn } from '@/shared/lib'
import { Icon } from '@/shared/ui'

type SetRowProps = {
  exerciseName: string
  set: number
  plannedReps: number
  plannedKg: number
  previous?: LoggedSet
  logged?: LoggedSet
  current: boolean
  onLog: (reps: number, weightKg: number) => void
}

export function SetRow({
  exerciseName,
  set,
  plannedReps,
  plannedKg,
  previous,
  logged,
  current,
  onLog,
}: SetRowProps) {
  const [kg, setKg] = useState(String(logged?.weightKg ?? plannedKg))
  const [reps, setReps] = useState(String(logged?.reps ?? plannedReps))
  const cell = cn(
    'h-10 w-full rounded-xl bg-surface-2 text-center font-semibold tabular text-text',
    current && 'outline-2 outline-accent shadow-glow',
    logged && 'opacity-60',
  )
  return (
    <tr>
      <td className="p-1.5">
        <div className={cn(cell, 'grid place-items-center')}>{set}</div>
      </td>
      <td className="p-1.5 text-sm text-muted tabular">
        {previous ? `${previous.weightKg} × ${previous.reps}` : '–'}
      </td>
      <td className="p-1.5">
        <input
          aria-label={`${exerciseName} set ${set} weight in kg`}
          inputMode="decimal"
          className={cell}
          value={kg}
          onChange={(e) => setKg(e.target.value)}
        />
      </td>
      <td className="p-1.5">
        <input
          aria-label={`${exerciseName} set ${set} reps`}
          inputMode="numeric"
          className={cell}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
      </td>
      <td className="p-1.5">
        <button
          type="button"
          aria-label={`Log set ${set}`}
          aria-pressed={!!logged}
          onClick={() => onLog(Number(reps) || 0, Number(kg) || 0)}
          className={cn(
            'grid size-10 place-items-center rounded-xl',
            logged ? 'bg-ok text-bg' : 'bg-surface-2 text-muted',
          )}
        >
          <Icon name="check" />
        </button>
      </td>
    </tr>
  )
}
