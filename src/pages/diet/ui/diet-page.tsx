import { useState } from 'react'
import { useFoodMap, useFoods } from '@/entities/library'
import { macrosFor, SLOTS, sumMacros, useMealLogs, useMealPlan } from '@/entities/nutrition'
import { AddFoodSheet, logPlannedMeal, removeMealLog } from '@/features/log-meal'
import { ScanSheet } from '@/features/scan-barcode'
import type { Food } from '@/shared/db'
import { Button, Card, Icon } from '@/shared/ui'
import { NutritionSummary } from '@/widgets/nutrition-summary'

type Sheet = { kind: 'add'; food?: Food } | { kind: 'scan' } | null

export function DietPage() {
  const plan = useMealPlan()
  const logs = useMealLogs()
  const foods = useFoods()
  const foodMap = useFoodMap()
  const [sheet, setSheet] = useState<Sheet>(null)

  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Today</p>
          <h1 id="page-title" className="text-[26px] font-bold">
            Diet
          </h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setSheet({ kind: 'add' })}>
            <Icon name="plus" />
            Add
          </Button>
          <Button size="sm" onClick={() => setSheet({ kind: 'scan' })}>
            <Icon name="scan" />
            Scan
          </Button>
        </div>
      </div>

      <NutritionSummary variant="bar" />

      <Card className="px-4 py-1.5">
        <ul className="divide-y divide-border">
          {SLOTS.map(({ slot, label }) => {
            const entries = logs.filter((l) => l.slot === slot)
            const planned = plan?.meals.find((m) => m.slot === slot)
            const plannedKcal = sumMacros(
              (planned?.items ?? []).flatMap((it) => {
                const f = foodMap.get(it.foodId)
                return f ? [macrosFor(f, it.grams)] : []
              }),
            ).kcal
            const plannedNames = (planned?.items ?? [])
              .map((it) => foodMap.get(it.foodId)?.name.split(',')[0])
              .filter(Boolean)
              .join(', ')
            return (
              <li key={slot} className="py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <b>{label}</b>
                    {entries.length === 0 && (
                      <p className="truncate text-xs text-muted">
                        Planned: {plannedNames || '—'} · {plannedKcal} kcal
                      </p>
                    )}
                  </div>
                  {entries.length > 0 ? (
                    <b className="text-sm tabular">
                      {sumMacros(entries.map((e) => e.macros)).kcal}
                    </b>
                  ) : (
                    plan && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void logPlannedMeal(plan, slot, foodMap)}
                      >
                        Log planned
                      </Button>
                    )
                  )}
                </div>
                {entries.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-1">
                    {entries.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center justify-between text-xs text-muted"
                      >
                        <span>
                          {foodMap.get(e.foodId)?.name ?? e.foodId} · {e.grams} g · {e.macros.kcal}{' '}
                          kcal
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${foodMap.get(e.foodId)?.name ?? 'entry'}`}
                          onClick={() => void removeMealLog(e.id)}
                          className="p-1"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      {sheet?.kind === 'add' && (
        <AddFoodSheet foods={foods} initialFood={sheet.food} onClose={() => setSheet(null)} />
      )}
      {sheet?.kind === 'scan' && (
        <ScanSheet
          onFound={(food) => setSheet({ kind: 'add', food })}
          onClose={() => setSheet(null)}
        />
      )}
    </section>
  )
}
