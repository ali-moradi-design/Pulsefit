import { create } from 'zustand'
import { saveRecord } from '@/shared/api'
import { db, type LoggedSet, type Program, type ProgramDay, type WorkoutLog } from '@/shared/db'
import { newId, persistStorage, toDateKey } from '@/shared/lib'
import { useBusy } from '@/shared/model'

type Rest = { endsAt: number; total: number }

type SessionState = {
  log: WorkoutLog | null
  day: ProgramDay | null
  exerciseIndex: number
  rest: Rest | null
  start: (program: Program, day: ProgramDay) => Promise<void>
  resume: (log: WorkoutLog, day: ProgramDay) => void
  logSet: (set: Omit<LoggedSet, 'doneAt'>, restSec: number) => Promise<void>
  goTo: (index: number) => void
  adjustRest: (deltaSec: number) => void
  skipRest: () => void
  finish: () => Promise<void>
}

const setBusy = (active: boolean) => useBusy.getState().setWorkoutActive(active)

export const useSession = create<SessionState>()((set, get) => ({
  log: null,
  day: null,
  exerciseIndex: 0,
  rest: null,

  start: async (program, day) => {
    const log: WorkoutLog = {
      id: newId(),
      date: toDateKey(),
      programId: program.id,
      dayTitle: day.title,
      sets: [],
      startedAt: Date.now(),
    }
    await saveRecord('workoutLogs', log)
    // The first logged workout is a good moment to ask the browser to keep our data.
    void persistStorage()
    set({ log, day, exerciseIndex: 0, rest: null })
    setBusy(true)
  },

  resume: (log, day) => {
    const done = new Set(log.sets.map((s) => s.exerciseId))
    const firstOpen = day.items.findIndex(
      (it) => log.sets.filter((s) => s.exerciseId === it.exerciseId).length < it.sets,
    )
    set({
      log,
      day,
      exerciseIndex: firstOpen === -1 ? Math.max(0, done.size - 1) : firstOpen,
      rest: null,
    })
    setBusy(true)
  },

  logSet: async (s, restSec) => {
    const { log } = get()
    if (!log) return
    const sets = [
      ...log.sets.filter((x) => !(x.exerciseId === s.exerciseId && x.set === s.set)),
      { ...s, doneAt: Date.now() },
    ]
    const next = { ...log, sets }
    set({
      log: next,
      rest: restSec > 0 ? { endsAt: Date.now() + restSec * 1000, total: restSec } : null,
    })
    await saveRecord('workoutLogs', next)
  },

  goTo: (exerciseIndex) => set({ exerciseIndex, rest: null }),

  adjustRest: (deltaSec) => {
    const { rest } = get()
    if (!rest) return
    const endsAt = Math.max(Date.now(), rest.endsAt + deltaSec * 1000)
    set({ rest: { endsAt, total: Math.max(rest.total + deltaSec, 1) } })
  },

  skipRest: () => set({ rest: null }),

  finish: async () => {
    const { log } = get()
    if (log) await saveRecord('workoutLogs', { ...log, finishedAt: Date.now() })
    set({ log: null, day: null, exerciseIndex: 0, rest: null })
    setBusy(false)
  },
}))

/** An unfinished log from today means the page was reloaded mid-workout. */
export const findOpenLog = () =>
  db.workoutLogs
    .where('date')
    .equals(toDateKey())
    .filter((l) => !l.finishedAt)
    .first()
