import { useEffect, useRef, useState } from 'react'
import { findFoodByBarcode } from '@/entities/library'
import type { Food } from '@/shared/db'
import { vibrate } from '@/shared/lib'
import { Button, Card, Icon } from '@/shared/ui'
import { createDetector, supportsBarcodeDetector, supportsCamera } from '../model/detector'

type ScanSheetProps = { onFound: (food: Food) => void; onClose: () => void }

/** Camera scanning where BarcodeDetector exists; typing the code works everywhere. */
export function ScanSheet({ onFound, onClose }: ScanSheetProps) {
  const video = useRef<HTMLVideoElement>(null)
  const canScan = supportsBarcodeDetector() && supportsCamera()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const lookup = async (value: string) => {
    const food = await findFoodByBarcode(value.trim())
    if (food) {
      vibrate(80)
      onFound(food)
    } else setError(`No food with barcode ${value} in the bundled list.`)
  }

  useEffect(() => {
    if (!canScan) return
    let stream: MediaStream | null = null
    let stop = false
    const detector = createDetector()
    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (stop || !video.current) return
        video.current.srcObject = stream
        await video.current.play()
        while (!stop && detector && video.current) {
          const codes = await detector.detect(video.current).catch(() => [])
          if (codes[0]) {
            stop = true
            await lookup(codes[0].rawValue)
            break
          }
          await new Promise((r) => setTimeout(r, 300))
        }
      } catch {
        setError('Camera not available. Type the barcode instead.')
      }
    })()
    return () => {
      stop = true
      stream?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canScan])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-title"
      className="fixed inset-0 z-30 flex items-end bg-black/50"
    >
      <Card className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-b-none">
        <div className="flex items-center justify-between">
          <h2 id="scan-title" className="text-lg font-bold">
            Scan barcode
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-muted">
            <Icon name="close" />
          </button>
        </div>
        {canScan ? (
          <video
            ref={video}
            muted
            playsInline
            className="aspect-video w-full rounded-xl bg-black object-cover"
          />
        ) : (
          <p className="text-sm text-muted">
            This browser cannot scan with the camera. Type the code below.
          </p>
        )}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            void lookup(code)
          }}
        >
          <input
            aria-label="Barcode"
            inputMode="numeric"
            placeholder="e.g. 2000000000015"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-11 flex-1 rounded-xl bg-surface-2 px-3 text-base"
          />
          <Button type="submit">Find</Button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        )}
      </Card>
    </div>
  )
}
