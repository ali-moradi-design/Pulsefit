import { useEffect, useId, useState, type ReactNode } from 'react'
import { Card } from './card'
import { Icon } from './icon'

type SheetProps = { title: string; onClose: () => void; children: ReactNode }

/** Bottom sheet dialog; Escape closes it. */
export function Sheet({ title, onClose, children }: SheetProps) {
  const id = useId()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
      className="fixed inset-0 z-30 flex items-end bg-black/50"
    >
      <Card className="mx-auto flex max-h-[85dvh] w-full max-w-xl flex-col gap-3 overflow-auto rounded-b-none">
        <div className="flex items-center justify-between">
          <h2 id={id} className="text-lg font-bold">
            {title}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-muted">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  )
}

type PickerItem = { id: string; label: string; sub?: string }

export function PickerSheet({
  title,
  items,
  onPick,
  onClose,
}: {
  title: string
  items: PickerItem[]
  onPick: (id: string) => void
  onClose: () => void
}) {
  return (
    <Sheet title={title} onClose={onClose}>
      <PickerList items={items} onPick={onPick} />
    </Sheet>
  )
}

function PickerList({ items, onPick }: { items: PickerItem[]; onPick: (id: string) => void }) {
  const [q, setQ] = useState('')
  const list = items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <input
        autoFocus
        type="search"
        aria-label="Search"
        placeholder="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="h-11 w-full min-w-0 rounded-xl bg-surface-2 px-3 text-base"
      />
      <ul className="divide-y divide-border">
        {list.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => onPick(i.id)}
              className="flex w-full items-center justify-between py-2.5 text-left"
            >
              <span>
                <b className="text-sm">{i.label}</b>
                {i.sub && <span className="block text-xs text-muted">{i.sub}</span>}
              </span>
              <Icon name="plus" className="text-accent" />
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
