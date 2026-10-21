import type { ComponentProps } from 'react'
import { cn } from '../lib'

type FieldProps = ComponentProps<'input'> & { label: string; error?: string }

/** Labelled text input in the mockup style. */
export function Field({ label, error, className, ...rest }: FieldProps) {
  return (
    <label
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-2xl border border-border bg-surface px-3.5 py-2',
        className,
      )}
    >
      <span className="text-[11px] font-semibold tracking-[.06em] text-muted uppercase">
        {label}
      </span>
      <input
        aria-invalid={!!error}
        className="w-full min-w-0 bg-transparent font-semibold text-text outline-none"
        {...rest}
      />
      {error && (
        <span role="alert" className="text-xs text-accent">
          {error}
        </span>
      )}
    </label>
  )
}
