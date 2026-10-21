import { useEffect, useState } from 'react'
import { subscribe, type ChannelMessage } from '@/shared/db'

export type Toast = { id: number; text: string }

export function describe(m: ChannelMessage): string | null {
  switch (m.type) {
    case 'program-assigned':
      return `Coach Lee updated your program: ${m.programName}`
    case 'meal-plan-assigned':
      return `Coach Lee updated your meal plan: ${m.planName}`
    case 'note-sent':
      return `New note from Coach Lee: ${m.text}`
    default:
      return null
  }
}

/** Messages from another tab (the coach) shown as toasts in the athlete tab. */
export function useLiveToasts(
  enabled: boolean,
  onMessage?: (m: ChannelMessage, text: string) => void,
) {
  const [toasts, setToasts] = useState<Toast[]>([])
  useEffect(() => {
    if (!enabled) return
    return subscribe((m) => {
      const text = describe(m)
      if (!text) return
      const id = Date.now()
      setToasts((t) => [...t, { id, text }])
      onMessage?.(m, text)
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000)
    })
  }, [enabled, onMessage])
  return { toasts, dismiss: (id: number) => setToasts((t) => t.filter((x) => x.id !== id)) }
}
