import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  size?: 'md' | 'sm'
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold transition active:scale-[.98] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        size === 'md' ? 'h-12 px-5 text-[15px]' : 'h-9 px-3 text-sm',
        variant === 'primary' ? 'bg-accent text-on-accent shadow-glow' : 'bg-surface-2 text-text',
        block && 'w-full',
        className,
      )}
      {...rest}
    />
  )
}
