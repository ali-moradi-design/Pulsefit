/// <reference lib="webworker" />
import Dexie, { type EntityTable } from 'dexie'
import type { OutboxEntry } from '@/shared/db'

/**
 * A stand-in for a real backend. It lives inside the service worker and keeps its own
 * database, so the outbox, Background Sync and network-first caching have something
 * real to talk to. It only answers while the network is reachable.
 */
type ServerRecord = { id: string; table: string; key: string; value: unknown; receivedAt: number }

class ServerDb extends Dexie {
  records!: EntityTable<ServerRecord, 'id'>
  meta!: EntityTable<{ key: string; value: number }, 'key'>
  constructor() {
    super('pulsefit-mock-server')
    this.version(1).stores({ records: 'id, table', meta: 'key' })
  }
}

const server = new ServerDb()

/** Throws when offline, like a real request would. */
export async function assertOnline() {
  await fetch(`/favicon.svg?probe=${Date.now()}`, { method: 'HEAD', cache: 'no-store' })
}

async function bump(key: string, by = 1) {
  const cur = (await server.meta.get(key))?.value ?? 0
  await server.meta.put({ key, value: cur + by })
}

export async function applyChange(entry: OutboxEntry) {
  const id = `${entry.table}:${entry.key}`
  // Simulated latency so the "syncing" state is visible.
  await new Promise((r) => setTimeout(r, 150))
  if (entry.op === 'delete') await server.records.delete(id)
  else
    await server.records.put({
      id,
      table: entry.table,
      key: entry.key,
      value: entry.value,
      receivedAt: Date.now(),
    })
  await bump('received')
  await server.meta.put({ key: 'lastSyncAt', value: Date.now() })
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

/** Routes of the fake API. */
export async function handleApi(url: URL): Promise<Response> {
  if (url.pathname === '/api/status') {
    return json({
      simulated: true,
      received: (await server.meta.get('received'))?.value ?? 0,
      lastSyncAt: (await server.meta.get('lastSyncAt'))?.value ?? null,
      records: await server.records.count(),
      servedAt: Date.now(),
    })
  }
  const m = url.pathname.match(/^\/api\/(programs|mealPlans|notes|workoutLogs|mealLogs|bodyLogs)$/)
  if (m) {
    const rows = await server.records.where('table').equals(m[1]!).toArray()
    return json(rows.map((r) => r.value))
  }
  return json({ error: 'Not found' }, 404)
}

export const API_CACHE = 'api'

/** Network first: ask the (simulated) server, fall back to the last cached answer. */
export async function networkFirstApi(request: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE)
  try {
    await assertOnline()
    const res = await handleApi(new URL(request.url))
    if (res.ok) await cache.put(request, res.clone())
    return res
  } catch {
    const cached = await cache.match(request)
    if (cached) {
      const headers = new Headers(cached.headers)
      headers.set('X-From-Cache', '1')
      return new Response(cached.body, { status: cached.status, headers })
    }
    return json({ error: 'Offline and not cached' }, 503)
  }
}

export async function clearServer() {
  await server.records.clear()
  await server.meta.clear()
  await caches.delete(API_CACHE)
}
