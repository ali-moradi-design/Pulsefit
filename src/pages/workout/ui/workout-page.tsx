import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import {
  dayFor,
  estimateMinutes,
  nextDay,
  totalSets,
  useProgram,
  useTodayWorkoutLog,
  WEEKDAYS,
} from '@/entities/training'
import { findOpenLog, useSession, WorkoutPlayer } from '@/features/workout-session'
import type { ProgramDay } from '@/shared/db'
import { unlockAudio } from '@/shared/lib'
import { Button, Card, Icon } from '@/shared/ui'

export function WorkoutPage() {
  const program = useProgram()
  const todayLog = useTodayWorkoutLog()
  const { log, start, resume } = useSession()
  const [params, setParams] = useSearchParams()
  const today = dayFor(program)
  const tried = useRef(false)

  // Resume after a reload, or auto-start from the "Start workout" shortcut.
  useEffect(() => {
    if (!program || log || tried.current) return
    tried.current = true
    void findOpenLog().then((open) => {
      const day = open && program.days.find((d) => d.title === open.dayTitle)
      if (open && day) resume(open, day)
      else if (params.get('start') === '1' && today && !todayLog?.finishedAt)
        void start(program, today)
      if (params.has('start')) setParams({}, { replace: true })
    })
  }, [program, log, params, setParams, today, todayLog, start, resume])

  if (log) return <WorkoutPlayer />
  if (!program) return null

  const begin = (day: ProgramDay) => {
    unlockAudio()
    void start(program, day)
  }

  if (todayLog?.finishedAt) {
    const volume = todayLog.sets.reduce((v, s) => v + s.weightKg * s.reps, 0)
    return (
      <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
        <h1 id="page-title" className="text-[26px] font-bold">
          Workout complete
        </h1>
        <Card className="flex flex-col gap-1">
          <b className="font-display text-xl">{todayLog.dayTitle}</b>
          <p className="text-muted">
            {todayLog.sets.length} sets · {Math.round(volume).toLocaleString('en')} kg total volume
            · {Math.round(((todayLog.finishedAt ?? 0) - todayLog.startedAt) / 60_000)} min
          </p>
        </Card>
      </section>
    )
  }

  const upcoming = nextDay(program)
  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <h1 id="page-title" className="text-[26px] font-bold">
        {today ? today.title : 'Rest day'}
      </h1>
      {today ? (
        <Card className="flex flex-col gap-3">
          <p className="text-muted">
            {today.items.length} exercises · {totalSets(today)} sets · ~{estimateMinutes(today)} min
          </p>
          <Button block onClick={() => begin(today)}>
            <Icon name="dumbbell" />
            Start workout
          </Button>
        </Card>
      ) : (
        <p className="text-muted">
          Recovery is part of the plan.
          {upcoming ? ` Next: ${upcoming.title} on ${WEEKDAYS[upcoming.weekday]}.` : ''}
        </p>
      )}
      <h2 className="mt-2 text-sm font-semibold tracking-[.06em] text-muted uppercase">
        {program.name} days
      </h2>
      <Card className="py-1">
        <ul className="divide-y divide-border">
          {program.days.map((d) => (
            <li key={d.weekday} className="flex items-center justify-between gap-2 py-2.5">
              <div>
                <b className="text-sm">
                  {WEEKDAYS[d.weekday]} · {d.title}
                </b>
                <p className="text-xs text-muted">
                  {d.items.length} exercises · ~{estimateMinutes(d)} min
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => begin(d)}>
                Do now
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  )
}
