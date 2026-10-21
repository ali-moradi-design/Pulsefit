import { useBusy } from '@/shared/model'
import { Button } from '@/shared/ui'
import { useUpdates } from '../model/updates'

export function UpdatePrompt() {
  const { needRefresh, dismissed, update, dismiss } = useUpdates()
  const workoutActive = useBusy((s) => s.workoutActive)
  // Never swap the app in the middle of a workout.
  if (!needRefresh || dismissed || workoutActive) return null
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-24 z-20 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-lg"
    >
      <p className="flex-1 text-sm font-semibold">New version available</p>
      <Button size="sm" variant="ghost" onClick={dismiss}>
        Later
      </Button>
      <Button size="sm" onClick={() => void update()}>
        Update
      </Button>
    </div>
  )
}
