import { notificationPermission, requestNotifications } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { showReminder, useReminder } from '../model/reminder'

export function ReminderSettings() {
  const { enabled, time, setEnabled, setTime } = useReminder()
  const permission = notificationPermission()

  const toggle = async () => {
    if (!enabled && permission !== 'granted') {
      if ((await requestNotifications()) !== 'granted') return
    }
    setEnabled(!enabled)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => void toggle()}
            className="size-5 accent-[var(--accent)]"
          />
          Workout reminder
        </label>
        <input
          type="time"
          aria-label="Reminder time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="h-9 rounded-lg bg-surface-2 px-2 text-sm"
        />
      </div>
      {permission === 'unsupported' && (
        <p className="text-xs text-muted">Notifications are not supported here.</p>
      )}
      {permission === 'denied' && (
        <p className="text-xs text-muted">Notifications are blocked in the browser settings.</p>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={permission !== 'granted'}
        onClick={() => void showReminder()}
      >
        Show a test reminder
      </Button>
    </div>
  )
}
