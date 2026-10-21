/// <reference lib="webworker" />
import { db, postMessage } from '@/shared/db'
import { applyChange, assertOnline } from './mock-server'

let running: Promise<number> | null = null

/** Sends every queued change to the server in order. Throws when offline so sync retries. */
export function flushOutbox(): Promise<number> {
  running ??= (async () => {
    try {
      const entries = await db.outbox.orderBy('seq').toArray()
      if (entries.length === 0) return 0
      await assertOnline()
      for (const entry of entries) {
        try {
          await applyChange(entry)
          await db.outbox.delete(entry.seq!)
        } catch (err) {
          await db.outbox.update(entry.seq!, { attempts: entry.attempts + 1 })
          throw err
        }
      }
      postMessage({ type: 'synced', count: entries.length })
      return entries.length
    } finally {
      running = null
    }
  })()
  return running
}
