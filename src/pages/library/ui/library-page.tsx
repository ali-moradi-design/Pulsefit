import { useState } from 'react'
import { useExercises, useFoods } from '@/entities/library'
import { macrosFor } from '@/entities/nutrition'
import { AddExerciseForm } from '@/features/add-exercise'
import { Button, Card, Icon, Segmented, Sheet } from '@/shared/ui'

type Tab = 'exercises' | 'foods'

export function LibraryPage() {
  const exercises = useExercises()
  const foods = useFoods()
  const [tab, setTab] = useState<Tab>('exercises')
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase())

  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h1 id="page-title" className="text-2xl font-bold">
          Library
        </h1>
        <Segmented
          label="Library"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'exercises', label: 'Exercises' },
            { value: 'foods', label: 'Foods' },
          ]}
        />
      </div>
      <div className="flex gap-2">
        <input
          type="search"
          aria-label={`Search ${tab}`}
          placeholder={`Search ${tab}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 text-base"
        />
        {tab === 'exercises' && (
          <Button size="sm" className="h-11" onClick={() => setAdding(true)}>
            <Icon name="plus" />
            New
          </Button>
        )}
      </div>
      <Card className="px-4 py-1">
        <ul className="divide-y divide-border">
          {tab === 'exercises'
            ? exercises
                .filter((e) => match(e.name))
                .map((e) => (
                  <li key={e.id} className="py-2.5">
                    <b className="text-sm">{e.name}</b>
                    <p className="text-xs text-muted">
                      {e.muscle} · {e.equipment}
                      {e.id.startsWith('custom-') ? ' · custom' : ''}
                    </p>
                    {e.cue && <p className="text-xs text-muted">{e.cue}</p>}
                  </li>
                ))
            : foods
                .filter((f) => match(f.name))
                .map((f) => {
                  const m = macrosFor(f, 100)
                  return (
                    <li key={f.id} className="py-2.5">
                      <b className="text-sm">{f.name}</b>
                      <p className="text-xs text-muted tabular">
                        per 100 g: {m.kcal} kcal · P {m.protein} · C {m.carbs} · F {m.fat} · barcode{' '}
                        {f.barcode}
                      </p>
                    </li>
                  )
                })}
        </ul>
      </Card>
      {tab === 'foods' && (
        <p className="text-xs text-muted">
          Food values are based on USDA FoodData Central (public domain). Barcodes are demo codes.
        </p>
      )}
      {adding && (
        <Sheet title="New exercise" onClose={() => setAdding(false)}>
          <AddExerciseForm onDone={() => setAdding(false)} />
        </Sheet>
      )}
    </section>
  )
}
