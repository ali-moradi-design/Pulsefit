import { cn } from '../lib'

type Option<T extends string> = { value: T; label: string }

type SegmentedProps<T extends string> = {
  label: string
  value: T
  options: ReadonlyArray<Option<T>>
  onChange: (value: T) => void
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-full bg-surface-2 p-[3px]"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-semibold',
            o.value === value ? 'bg-surface text-text shadow-sm' : 'text-muted',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
