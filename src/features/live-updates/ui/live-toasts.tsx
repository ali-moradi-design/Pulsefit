import { Icon } from '@/shared/ui'
import { useLiveToasts } from '../model/live-updates'

export function LiveToasts({ enabled }: { enabled: boolean }) {
  const { toasts, dismiss } = useLiveToasts(enabled)
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-3 z-40 mx-auto flex max-w-md flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-lg"
        >
          <Icon name="bell" className="flex-none text-accent" />
          <p className="flex-1 text-sm font-semibold">{t.text}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(t.id)}
            className="text-muted"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
