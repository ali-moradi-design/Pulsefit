import { useEffect, useState } from 'react'
import { useExerciseMap } from '@/entities/library'
import { previousSets, totalSets, useWorkoutLogs } from '@/entities/training'
import { useWakeLock } from '@/shared/lib'
import { Button, Card, Chip, Icon, ProgressBar } from '@/shared/ui'
import { useSession } from '../model/session'
import { RestTimer } from './rest-timer'
import { SetRow } from './set-row'

function useElapsed(startedAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const s = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function WorkoutPlayer({ onRestDone }: { onRestDone?: () => void }) {
  const { log, day, exerciseIndex, logSet, goTo, finish } = useSession()
  const exercises = useExerciseMap()
  const history = useWorkoutLogs()
  const locked = useWakeLock(!!log)
  const elapsed = useElapsed(log?.startedAt)

  if (!log || !day) return null
  const item = day.items[exerciseIndex]
  if (!item) return null
  const exercise = exercises.get(item.exerciseId)
  const name = exercise?.name ?? item.exerciseId
  const prev = previousSets(history, item.exerciseId, log.date)
  const done = log.sets.filter((s) => s.exerciseId === item.exerciseId)
  const nextSet = Array.from({ length: item.sets }, (_, i) => i + 1).find(
    (n) => !done.some((s) => s.set === n),
  )
  const isLast = exerciseIndex === day.items.length - 1

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold">{day.title}</h1>
        {locked && (
          <Chip>
            <Icon name="sun" size={14} />
            Screen stays on
          </Chip>
        )}
      </div>
      <div>
        <div className="flex justify-between text-xs text-muted">
          <span>
            Exercise {exerciseIndex + 1} of {day.items.length}
          </span>
          <span className="tabular">{elapsed} elapsed</span>
        </div>
        <div className="mt-1.5">
          <ProgressBar label="Workout progress" value={log.sets.length} max={totalSets(day)} />
        </div>
      </div>
      <div>
        <h2 className="text-[28px] font-bold">{name}</h2>
        <p className="text-sm text-muted">
          {item.sets} × {item.reps}
          {prev[0] ? ` · last time ${prev[0].weightKg} kg × ${prev[0].reps}` : ''}
        </p>
        {exercise && <p className="mt-1 text-sm text-muted">Tip: {exercise.cue}</p>}
      </div>

      <Card className="px-2.5 py-3">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] font-semibold tracking-[.06em] text-muted uppercase">
              <th className="px-1.5 pb-1">Set</th>
              <th className="px-1.5 pb-1">Previous</th>
              <th className="px-1.5 pb-1">kg</th>
              <th className="px-1.5 pb-1">Reps</th>
              <th className="px-1.5 pb-1">
                <span className="sr-only">Done</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: item.sets }, (_, i) => i + 1).map((n) => (
              <SetRow
                key={`${item.exerciseId}-${n}`}
                exerciseName={name}
                set={n}
                plannedReps={item.reps}
                plannedKg={item.weightKg}
                previous={prev.find((p) => p.set === n)}
                logged={done.find((d) => d.set === n)}
                current={n === nextSet}
                onLog={(reps, weightKg) =>
                  void logSet(
                    { exerciseId: item.exerciseId, set: n, reps, weightKg },
                    n < item.sets ? item.restSec : 0,
                  )
                }
              />
            ))}
          </tbody>
        </table>
      </Card>

      <RestTimer onDone={onRestDone} />

      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="flex-1"
          disabled={exerciseIndex === 0}
          onClick={() => goTo(exerciseIndex - 1)}
        >
          Previous
        </Button>
        {isLast ? (
          <Button className="flex-1" onClick={() => void finish()}>
            Finish workout
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => goTo(exerciseIndex + 1)}>
            Next exercise
          </Button>
        )}
      </div>
    </div>
  )
}
