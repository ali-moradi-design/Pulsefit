import { useEffect, useRef } from 'react'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

type LineChartProps = {
  /** Unix seconds. */
  x: number[]
  y: number[]
  label: string
  unit: string
  height?: number
}

const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/** Small uPlot line chart that follows the current theme colors. */
export function LineChart({ x, y, label, unit, height = 180 }: LineChartProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || x.length === 0) return
    let plot: uPlot | null = null
    const build = () => {
      plot?.destroy()
      const accent = cssVar('--accent')
      const muted = cssVar('--muted')
      const grid = cssVar('--border')
      const glow = document.documentElement.dataset.theme === 'neon'
      const axis = {
        stroke: muted,
        grid: { stroke: grid, width: 1 },
        ticks: { show: false },
        font: '12px Figtree Variable, sans-serif',
      }
      plot = new uPlot(
        {
          width: el.clientWidth,
          height,
          legend: { show: false },
          cursor: { points: { size: 8, fill: accent } },
          scales: { x: { time: true } },
          axes: [axis, { ...axis, size: 44, values: (_, v) => v.map((n) => `${n}`) }],
          series: [
            {},
            {
              label,
              stroke: accent,
              width: glow ? 3 : 2.5,
              fill: `color-mix(in srgb, ${accent} 14%, transparent)`,
              points: { show: true, size: 5, fill: accent },
              value: (_, v) => (v == null ? '' : `${v} ${unit}`),
            },
          ],
        },
        [x, y],
        el,
      )
    }
    build()
    const ro = new ResizeObserver(() => plot?.setSize({ width: el.clientWidth, height }))
    ro.observe(el)
    const mo = new MutationObserver(build)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      ro.disconnect()
      mo.disconnect()
      plot?.destroy()
    }
  }, [x, y, label, unit, height])

  const last = y.at(-1)
  return (
    <figure>
      <div
        ref={ref}
        role="img"
        aria-label={`${label} chart, latest ${last ?? '–'} ${unit}`}
        className="neon:drop-shadow-[0_0_6px_rgb(34_227_245/.35)]"
      />
    </figure>
  )
}
