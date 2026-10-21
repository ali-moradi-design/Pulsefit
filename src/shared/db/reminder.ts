import { db } from './db'

const PROGRAM_ID = 'program-demo'

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export type ReminderSettings = { enabled: boolean; time: string }

/** Settings are mirrored here so the service worker can read them during Periodic Sync. */
export const saveReminderSettings = (value: ReminderSettings) =>
  db.meta.put({ key: 'reminder', value })

export const loadReminderSettings = async () =>
  (await db.meta.get('reminder'))?.value as ReminderSettings | undefined

/** True when today is a training day, the reminder time has passed and nothing is finished. */
export async function isReminderDue(time: string, now = new Date()) {
  const [h, m] = time.split(':').map(Number)
  if (now.getHours() * 60 + now.getMinutes() < (h ?? 0) * 60 + (m ?? 0)) return false
  const program = await db.programs.get(PROGRAM_ID)
  if (!program?.days.some((d) => d.weekday === now.getDay())) return false
  const log = await db.workoutLogs.where('date').equals(dateKey(now)).first()
  return !log?.finishedAt
}

export { dateKey }
