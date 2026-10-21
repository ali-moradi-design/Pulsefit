import { supportsBackgroundSync, supportsPeriodicSync } from '@/shared/api'
import { supportsBarcodeDetector } from '@/features/scan-barcode'
import {
  notificationPermission,
  supportsBadging,
  supportsPersist,
  supportsVibration,
  supportsWakeLock,
} from '@/shared/lib'

export type Capability = { name: string; supported: boolean; detail?: string; use: string }

export function detectCapabilities(extra: {
  periodicTags: string[]
  persisted: boolean
  installed: boolean
}): Capability[] {
  const perm = notificationPermission()
  return [
    {
      name: 'Service worker',
      supported: 'serviceWorker' in navigator,
      detail: navigator.serviceWorker?.controller ? 'controlling this page' : 'not controlling yet',
      use: 'Offline app shell, caching, mock API',
    },
    {
      name: 'Installed',
      supported: extra.installed,
      detail: extra.installed ? 'running as an app' : 'running in a browser tab',
      use: 'Home screen icon, shortcut',
    },
    { name: 'IndexedDB', supported: 'indexedDB' in window, use: 'All data, offline' },
    {
      name: 'Background Sync',
      supported: supportsBackgroundSync(),
      detail: supportsBackgroundSync() ? undefined : 'fallback: sync on start and when online',
      use: 'Send queued changes later',
    },
    {
      name: 'Periodic Background Sync',
      supported: supportsPeriodicSync(),
      detail: extra.periodicTags.length
        ? `registered: ${extra.periodicTags.join(', ')}`
        : 'needs an installed app',
      use: 'Refresh program, reminders',
    },
    {
      name: 'Notifications',
      supported: perm !== 'unsupported',
      detail: perm === 'unsupported' ? undefined : `permission: ${perm}`,
      use: 'Coach notes, rest timer, reminders',
    },
    { name: 'Badging', supported: supportsBadging(), use: 'Unread notes on the app icon' },
    { name: 'Wake Lock', supported: supportsWakeLock(), use: 'Screen stays on during a workout' },
    { name: 'Vibration', supported: supportsVibration(), use: 'Rest timer finished' },
    {
      name: 'BarcodeDetector',
      supported: supportsBarcodeDetector(),
      detail: supportsBarcodeDetector() ? undefined : 'fallback: type the code',
      use: 'Scan food barcodes',
    },
    { name: 'Camera', supported: !!navigator.mediaDevices?.getUserMedia, use: 'Barcode scanning' },
    {
      name: 'BroadcastChannel',
      supported: typeof BroadcastChannel !== 'undefined',
      use: 'Live coach → athlete tabs',
    },
    {
      name: 'Persistent storage',
      supported: supportsPersist(),
      detail: extra.persisted ? 'granted' : 'not granted yet',
      use: 'Browser keeps the data',
    },
  ]
}
