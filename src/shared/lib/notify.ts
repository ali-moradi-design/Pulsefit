export const supportsNotifications = () => typeof window !== 'undefined' && 'Notification' in window

export const notificationPermission = (): NotificationPermission | 'unsupported' =>
  supportsNotifications() ? Notification.permission : 'unsupported'

export async function requestNotifications(): Promise<NotificationPermission | 'unsupported'> {
  if (!supportsNotifications()) return 'unsupported'
  return Notification.requestPermission()
}

export type NotificationData = {
  url?: string
  kind?: 'note' | 'reminder' | 'rest' | 'program'
  noteId?: string
}

/**
 * Local notification shown by the service worker, so it can carry action buttons and
 * works while the tab is in the background. No push server is involved.
 */
export async function notify(
  title: string,
  options: NotificationOptions & {
    data?: NotificationData
    actions?: Array<{ action: string; title: string }>
  } = {},
) {
  if (notificationPermission() !== 'granted' || !('serviceWorker' in navigator)) return false
  const reg = await navigator.serviceWorker.ready
  await reg.showNotification(title, {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    ...options,
  })
  return true
}

type BadgeNavigator = Navigator & {
  setAppBadge?: (n?: number) => Promise<void>
  clearAppBadge?: () => Promise<void>
}

export const supportsBadging = () => typeof navigator !== 'undefined' && 'setAppBadge' in navigator

export function setBadge(count: number) {
  const nav = navigator as BadgeNavigator
  if (!nav.setAppBadge) return
  void (count > 0 ? nav.setAppBadge(count) : nav.clearAppBadge?.())?.catch(() => undefined)
}
