/// <reference lib="webworker" />
import { dateKey, db, type SyncedRecords, type SyncedTable } from '@/shared/db'
import { flushOutbox } from './outbox'

async function save<T extends SyncedTable>(table: T, value: SyncedRecords[T]) {
  await db.transaction('rw', db.table(table), db.outbox, async () => {
    await db.table(table).put(value)
    await db.outbox.add({
      table,
      op: 'put',
      key: value.id,
      value,
      createdAt: Date.now(),
      attempts: 0,
    })
  })
  await flushOutbox().catch(() => 0)
}

/** "Mark done" on the reminder: the athlete trained without the app, log the plan as done. */
export async function markTodayDone() {
  const now = new Date()
  const program = await db.programs.get('program-demo')
  const day = program?.days.find((d) => d.weekday === now.getDay())
  if (!program || !day) return
  const existing = await db.workoutLogs.where('date').equals(dateKey(now)).first()
  const t = Date.now()
  await save('workoutLogs', {
    id: existing?.id ?? crypto.randomUUID(),
    date: dateKey(now),
    programId: program.id,
    dayTitle: day.title,
    startedAt: existing?.startedAt ?? t,
    finishedAt: t,
    sets:
      existing?.sets ??
      day.items.flatMap((it) =>
        Array.from({ length: it.sets }, (_, i) => ({
          exerciseId: it.exerciseId,
          set: i + 1,
          reps: it.reps,
          weightKg: it.weightKg,
          doneAt: t,
        })),
      ),
  })
}

export async function markNoteRead(noteId: string) {
  const note = await db.notes.get(noteId)
  if (note && !note.readAt) await save('notes', { ...note, readAt: Date.now() })
}
