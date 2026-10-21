import { useEffect, useRef, useState } from 'react'
import { beep, vibrate } from '@/shared/lib'
import { Button, Card, Ring } from '@/shared/ui'
import { useSession } from '../model/session'

const fmt = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

export function RestTimer({ onDone }: { onDone?: () => void }) {
  const rest = useSession((s) => s.rest)
  const adjustRest = useSession((s) => s.adjustRest)
  const skipRest = useSession((s) => s.skipRest)
  const [now, setNow] = useState(() => Date.now())
  const fired = useRef<number | null>(null)

  useEffect(() => {
    if (!rest) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [rest])

  const left = rest ? Math.max(0, Math.ceil((rest.endsAt - now) / 1000)) : 0

  useEffect(() => {
    if (!rest || left > 0 || fired.current === rest.endsAt) return
    fired.current = rest.endsAt
    vibrate([200, 100, 200, 100, 400])
    beep()
    onDone?.()
    skipRest()
  }, [left, rest, onDone, skipRest])

  if (!rest) return null
  return (
    <Card className="flex flex-col items-center gap-3">
      <span className="text-xs font-semibold tracking-[.06em] text-muted">REST</span>
      <Ring value={left} max={rest.total} size={150} glow>
        <b className="tabular font-display text-4xl" role="timer" aria-live="off">
          {fmt(left)}
        </b>
        <span className="text-xs text-muted">of {fmt(rest.total)}</span>
      </Ring>
      <div className="flex w-full gap-2">
        <Button variant="ghost" className="flex-1" onClick={() => adjustRest(-15)}>
          −15 s
        </Button>
        <Button variant="ghost" className="flex-1" onClick={() => adjustRest(15)}>
          +15 s
        </Button>
        <Button className="flex-[1.3]" onClick={skipRest}>
          Skip rest
        </Button>
      </div>
    </Card>
  )
}
