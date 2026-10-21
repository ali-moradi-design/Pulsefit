import { useMemo, useState } from 'react'
import { macrosFor, SLOTS } from '@/entities/nutrition'
import type { Food, MealSlot } from '@/shared/db'
import { Button, Card, Icon } from '@/shared/ui'
import { logFood, slotForNow } from '../model/log-meal'

type AddFoodSheetProps = {
  foods: Food[]
  initialFood?: Food
  onClose: () => void
}

export function AddFoodSheet({ foods, initialFood, onClose }: AddFoodSheetProps) {
  const [query, setQuery] = useState('')
  const [food, setFood] = useState<Food | undefined>(initialFood)
  const [grams, setGrams] = useState(String(initialFood?.serving.grams ?? ''))
  const [slot, setSlot] = useState<MealSlot>(slotForNow())
  const results = useMemo(
    () => foods.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
    [foods, query],
  )

  const pick = (f: Food) => {
    setFood(f)
    setGrams(String(f.serving.grams))
  }

  const g = Number(grams) || 0
  const m = food ? macrosFor(food, g) : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-food-title"
      className="fixed inset-0 z-30 flex items-end bg-black/50"
    >
      <Card className="mx-auto flex max-h-[85dvh] w-full max-w-xl flex-col gap-3 overflow-auto rounded-b-none">
        <div className="flex items-center justify-between">
          <h2 id="add-food-title" className="text-lg font-bold">
            {food ? food.name : 'Add food'}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-muted">
            <Icon name="close" />
          </button>
        </div>
        {!food ? (
          <>
            <input
              autoFocus
              type="search"
              aria-label="Search foods"
              placeholder="Search foods"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full min-w-0 rounded-xl bg-surface-2 px-3 text-base"
            />
            <ul className="divide-y divide-border">
              {results.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => pick(f)}
                    className="flex w-full items-center justify-between py-2.5 text-left"
                  >
                    <span>
                      <b className="text-sm">{f.name}</b>
                      <span className="block text-xs text-muted">
                        {f.serving.label} · {macrosFor(f, f.serving.grams).kcal} kcal
                      </span>
                    </span>
                    <Icon name="plus" className="text-accent" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-muted">
                Amount (g)
                <input
                  inputMode="decimal"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="h-11 w-full min-w-0 rounded-xl bg-surface-2 px-3 text-base text-text"
                />
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-muted">
                Meal
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value as MealSlot)}
                  className="h-11 w-full min-w-0 rounded-xl bg-surface-2 px-3 text-base text-text"
                >
                  {SLOTS.map((s) => (
                    <option key={s.slot} value={s.slot}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {m && (
              <p className="text-sm text-muted tabular">
                {m.kcal} kcal · P {m.protein} g · C {m.carbs} g · F {m.fat} g
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setFood(undefined)}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={g <= 0}
                onClick={() => void logFood(food, g, slot).then(onClose)}
              >
                Add to {SLOTS.find((s) => s.slot === slot)?.label}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
