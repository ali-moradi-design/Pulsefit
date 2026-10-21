/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

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

// Last resort for documents that are not in any cache.
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return (await caches.match('/offline.html')) ?? Response.error()
  }
  return Response.error()
})

// The page asks the waiting worker to take over only after the user agrees.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting()
})
