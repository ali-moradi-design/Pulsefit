import { describe, expect, it } from 'vitest'
import type { Food } from '@/shared/db'
import { macrosFor, sumMacros } from './nutrition'

const egg: Food = {
  id: 'egg',
  name: 'Egg',
  barcode: '1',
  per100g: { kcal: 155, protein: 12.6, carbs: 1.1, fat: 10.6 },
  serving: { label: '1 large', grams: 50 },
}

describe('nutrition', () => {
  it('scales macros by grams', () => {
    expect(macrosFor(egg, 50)).toEqual({ kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3 })
  })
  it('sums macros', () => {
    expect(sumMacros([macrosFor(egg, 100), macrosFor(egg, 100)]).kcal).toBe(310)
  })
})
