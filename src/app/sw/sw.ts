/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { isReminderDue, loadReminderSettings, PERIODIC_TAG, SYNC_TAG } from '@/shared/db'
import { markNoteRead, markTodayDone } from './actions'
import { clearServer, networkFirstApi } from './mock-server'
import { flushOutbox } from './outbox'

declare const self: ServiceWorkerGlobalScope

// App shell: every built file is precached and served from the cache.
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// SPA navigations get the precached index.html.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')))

// Images and fonts rarely change: cache first.
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'media',
    plugins: [new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 60 })],
  }),
)

// Exercise and food libraries: show the cached copy, refresh in the background.
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/data/'),
  new StaleWhileRevalidate({ cacheName: 'libraries' }),
)

// Mock API: network first with cache fallback.
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
  ({ request }) => networkFirstApi(request),
)

// Last resort for documents that are not in any cache.
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return (await caches.match('/offline.html')) ?? Response.error()
  }
  return Response.error()
})

// The page asks the waiting worker to take over only after the user agrees.
self.addEventListener('message', (event) => {
  const type = (event.data as { type?: string } | null)?.type
  if (type === 'SKIP_WAITING') void self.skipWaiting()
  if (type === 'FLUSH_OUTBOX') event.waitUntil(flushOutbox().catch(() => 0))
  if (type === 'RESET_SERVER') event.waitUntil(clearServer())
})

type SyncEvent = ExtendableEvent & { tag: string }

// Background Sync: the browser calls this when it is online, even if no tab is open.
// A rejected promise tells the browser to retry later.
self.addEventListener('sync', (event) => {
  const e = event as SyncEvent
  if (e.tag === SYNC_TAG) e.waitUntil(flushOutbox())
})

type NotificationData = { url?: string; kind?: string; noteId?: string }

// Notification buttons work even when no tab is open.
self.addEventListener('notificationclick', (event) => {
  const data = (event.notification.data ?? {}) as NotificationData
  event.notification.close()
  if (event.action === 'done') return event.waitUntil(markTodayDone())
  if (event.action === 'read' && data.noteId) return event.waitUntil(markNoteRead(data.noteId))
  const url = event.action === 'start' ? '/athlete/workout?start=1' : (data.url ?? '/athlete')
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const client = clients[0]
      if (client) {
        await client.focus()
        return void (await client.navigate(url).catch(() => null))
      }
      await self.clients.openWindow(url)
    })(),
  )
})

type PeriodicSyncEvent = ExtendableEvent & { tag: string }

// Periodic Background Sync (Chromium, installed app): refresh cached data now and then,
// and show the workout reminder if the app was not opened today.
self.addEventListener('periodicsync', (event) => {
  const e = event as PeriodicSyncEvent
  if (e.tag !== PERIODIC_TAG) return
  e.waitUntil(
    (async () => {
      await Promise.allSettled([
        caches
          .open('libraries')
          .then((c) => c.addAll(['/data/exercises.json', '/data/foods.json'])),
        networkFirstApi(new Request('/api/programs')),
        flushOutbox(),
      ])
      const settings = await loadReminderSettings()
      if (settings?.enabled && (await isReminderDue(settings.time))) {
        await self.registration.showNotification('Time to train', {
          body: 'Your workout for today is waiting.',
          icon: '/icons/icon-192.png',
          tag: 'reminder',
          data: { kind: 'reminder', url: '/athlete/workout?start=1' },
          actions: [
            { action: 'start', title: 'Start workout' },
            { action: 'done', title: 'Mark done' },
          ],
        } as NotificationOptions)
      }
    })(),
  )
})
