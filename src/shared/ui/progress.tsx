type ProgressBarProps = {
  value: number
  max: number
  color?: string
  label: string
  height?: number
}

export function ProgressBar({
  value,
  max,
  color = 'var(--accent)',
  label,
  height = 8,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className="overflow-hidden rounded-full bg-surface-2"
      style={{ height }}
    >
      <div
        className="h-full rounded-full shadow-glow"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

type RingProps = {
  value: number
  max: number
  size: number
  stroke?: number
  glow?: boolean
  children?: React.ReactNode
}

export function Ring({ value, max, size, stroke = 10, glow, children }: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(1, value / max) : 0
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="var(--surface-2)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="var(--accent)"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            filter: `drop-shadow(${glow ? 'var(--glow-strong)' : 'var(--glow)'})`,
            transition: 'stroke-dashoffset .3s linear',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
