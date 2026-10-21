import { useLiveQuery } from 'dexie-react-hooks'
import { DEMO_PROGRAM_ID } from '@/shared/api'
import { db, type Program, type ProgramDay, type WorkoutLog } from '@/shared/db'
import { toDateKey } from '@/shared/lib'

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function useProgram(): Program | undefined {
  return useLiveQuery(() => db.programs.get(DEMO_PROGRAM_ID), [])
}

export function dayFor(program: Program | undefined, date = new Date()): ProgramDay | undefined {
  return program?.days.find((d) => d.weekday === date.getDay())
}

export function nextDay(program: Program | undefined, date = new Date()): ProgramDay | undefined {
  if (!program) return undefined
  for (let i = 1; i <= 7; i++) {
    const day = program.days.find((d) => d.weekday === (date.getDay() + i) % 7)
    if (day) return day
  }
  return undefined
}

export function programWeek(program: Program, date = new Date()): number {
  const start = new Date(`${program.startDate}T00:00:00`)
  const week = Math.floor((date.getTime() - start.getTime()) / (7 * 86_400_000)) + 1
  return Math.min(Math.max(week, 1), program.weeks)
}

export function useWorkoutLogs(): WorkoutLog[] {
  return useLiveQuery(() => db.workoutLogs.orderBy('date').toArray(), [], [])
}

export function useTodayWorkoutLog(): WorkoutLog | undefined {
  return useLiveQuery(() => db.workoutLogs.where('date').equals(toDateKey()).first(), [])
}

export const totalSets = (day: ProgramDay) => day.items.reduce((n, it) => n + it.sets, 0)

/** Rough duration: work sets plus rests. */
export const estimateMinutes = (day: ProgramDay) =>
  Math.round(day.items.reduce((m, it) => m + it.sets * (0.75 + it.restSec / 60), 0))

/** Heaviest weight lifted per exercise. */
export function personalRecords(
  logs: WorkoutLog[],
): Map<string, { weightKg: number; reps: number; date: string }> {
  const prs = new Map<string, { weightKg: number; reps: number; date: string }>()
  for (const log of logs) {
    for (const s of log.sets) {
      const cur = prs.get(s.exerciseId)
      if (s.weightKg > 0 && (!cur || s.weightKg > cur.weightKg)) {
        prs.set(s.exerciseId, { weightKg: s.weightKg, reps: s.reps, date: log.date })
      }
    }
  }
  return prs
}

/** Last logged sets of an exercise before today, for the "Previous" column. */
export function previousSets(logs: WorkoutLog[], exerciseId: string, beforeDate = toDateKey()) {
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i]!
    if (log.date >= beforeDate) continue
    const sets = log.sets.filter((s) => s.exerciseId === exerciseId)
    if (sets.length) return sets
  }
  return []
}
