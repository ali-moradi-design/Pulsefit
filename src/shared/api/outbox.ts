import { db, SYNC_TAG, type SyncedRecords, type SyncedTable } from '../db'

type SyncManagerLike = { register: (tag: string) => Promise<void> }

/** Writes a record locally and queues it for the server in one transaction. */
export async function saveRecord<T extends SyncedTable>(table: T, value: SyncedRecords[T]) {
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
  void requestSync()
}

export async function deleteRecord(table: SyncedTable, key: string) {
  await db.transaction('rw', db.table(table), db.outbox, async () => {
    await db.table(table).delete(key)
    await db.outbox.add({ table, op: 'delete', key, createdAt: Date.now(), attempts: 0 })
  })
  void requestSync()
}

export const supportsBackgroundSync = () => 'serviceWorker' in navigator && 'SyncManager' in window

/**
 * Background Sync lets the browser send the outbox later, even after the tab is closed.
 * Without it (Safari, Firefox) the page asks the worker to flush while it is online.
 */
export async function requestSync() {
  if (!('serviceWorker' in navigator)) return
  const reg = await navigator.serviceWorker.ready
  const sync = (reg as ServiceWorkerRegistration & { sync?: SyncManagerLike }).sync
  if (sync) {
    try {
      await sync.register(SYNC_TAG)
      return
    } catch {
      // Permission denied or unsupported: fall through to a direct flush.
    }
  }
  if (navigator.onLine) reg.active?.postMessage({ type: 'FLUSH_OUTBOX' })
}

/** Fallback triggers: app start and the browser coming back online. */
export function initSync() {
  if (!('serviceWorker' in navigator)) return
  const flush = () =>
    void navigator.serviceWorker.ready.then((reg) =>
      reg.active?.postMessage({ type: 'FLUSH_OUTBOX' }),
    )
  flush()
  window.addEventListener('online', flush)
}
