import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isReminderDue, saveReminderSettings } from '@/shared/db'
import { notify, toDateKey } from '@/shared/lib'

type ReminderState = {
  enabled: boolean
  time: string
  lastShown: string | null
  setEnabled: (enabled: boolean) => void
  setTime: (time: string) => void
}

export const useReminder = create<ReminderState>()(
  persist(
    (set) => ({
      enabled: false,
      time: '18:00',
      lastShown: null,
      setEnabled: (enabled) =>
        set((s) => {
          void saveReminderSettings({ enabled, time: s.time })
          return { enabled }
        }),
      setTime: (time) =>
        set((s) => {
          void saveReminderSettings({ enabled: s.enabled, time })
          return { time }
        }),
    }),
    { name: 'pulsefit-reminder' },
  ),
)

export const showReminder = () =>
  notify('Time to train', {
    body: 'Your workout for today is waiting.',
    tag: 'reminder',
    requireInteraction: true,
    data: { kind: 'reminder', url: '/athlete/workout?start=1' },
    actions: [
      { action: 'start', title: 'Start workout' },
      { action: 'done', title: 'Mark done' },
    ],
  })

/**
 * Checks every minute while the app is open or in a background tab. Browsers have no
 * reliable timer for closed apps without a push server; Periodic Sync covers some of that.
 */
export function useReminderScheduler() {
  const { enabled, time, lastShown } = useReminder()
  useEffect(() => {
    if (!enabled) return
    const check = async () => {
      const today = toDateKey()
      if (lastShown === today || !(await isReminderDue(time))) return
      if (await showReminder()) useReminder.setState({ lastShown: today })
    }
    void check()
    const id = setInterval(() => void check(), 60_000)
    return () => clearInterval(id)
  }, [enabled, time, lastShown])
}
