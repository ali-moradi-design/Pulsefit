import { useLiveQuery } from 'dexie-react-hooks'
import { db, type BodyLog } from '@/shared/db'
import { addDays, toDateKey } from '@/shared/lib'

export function useBodyLogs(): BodyLog[] {
  return useLiveQuery(() => db.bodyLogs.orderBy('date').toArray(), [], [])
}

/** Days in a row, ending today or yesterday, with any workout, meal or body log. */
export function useStreak(): number {
  return useLiveQuery(
    async () => {
      const [w, m, b] = await Promise.all([
        db.workoutLogs.orderBy('date').uniqueKeys(),
        db.mealLogs.orderBy('date').uniqueKeys(),
        db.bodyLogs.orderBy('date').uniqueKeys(),
      ])
      const days = new Set([...w, ...m, ...b].map(String))
      let d = new Date()
      if (!days.has(toDateKey(d))) d = addDays(d, -1)
      let streak = 0
      while (days.has(toDateKey(d))) {
        streak++
        d = addDays(d, -1)
      }
      return streak
    },
    [],
    0,
  )
}
