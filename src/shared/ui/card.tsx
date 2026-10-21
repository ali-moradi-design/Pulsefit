import type { HTMLAttributes } from 'react'
import { cn } from '../lib'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-[18px] border border-border bg-surface p-4', className)}
      {...rest}
    />
  )
}
