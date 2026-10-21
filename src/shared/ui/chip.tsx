import type { HTMLAttributes } from 'react'
import { cn } from '../lib'

type ChipProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'default' | 'accent' }

export function Chip({ tone = 'default', className, ...rest }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        tone === 'accent' ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-text',
        className,
      )}
      {...rest}
    />
  )
}
