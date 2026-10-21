import { useEffect, useState } from 'react'

export const supportsWakeLock = () => typeof navigator !== 'undefined' && 'wakeLock' in navigator

/** Keeps the screen on while `active`; the lock is re-taken when the tab becomes visible again. */
export function useWakeLock(active: boolean): boolean {
  const [locked, setLocked] = useState(false)
  useEffect(() => {
    if (!active || !supportsWakeLock()) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false
    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen')
        if (cancelled) return void sentinel.release()
        setLocked(true)
        sentinel.addEventListener('release', () => setLocked(false))
      } catch {
        setLocked(false)
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire()
    }
    void acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void sentinel?.release()
      setLocked(false)
    }
  }, [active])
  return locked
}
