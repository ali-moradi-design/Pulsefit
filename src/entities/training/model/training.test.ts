import { describe, expect, it } from 'vitest'
import type { Program, WorkoutLog } from '@/shared/db'
import { dayFor, nextDay, personalRecords, previousSets } from './training'

const program: Program = {
  id: 'p',
  name: 'P',
  weeks: 4,
  startDate: '2026-10-01',
  updatedAt: 0,
  days: [
    { weekday: 1, title: 'Mon', items: [] },
    { weekday: 4, title: 'Thu', items: [] },
  ],
}

const log = (date: string, weightKg: number): WorkoutLog => ({
  id: date,
  date,
  programId: 'p',
  dayTitle: 'Mon',
  startedAt: 0,
  sets: [{ exerciseId: 'squat', set: 1, reps: 5, weightKg, doneAt: 0 }],
})

describe('training', () => {
  it('finds the day for a weekday and the next one', () => {
    const tuesday = new Date('2026-10-20T10:00:00')
    expect(dayFor(program, tuesday)).toBeUndefined()
    expect(nextDay(program, tuesday)?.title).toBe('Thu')
  })
  it('keeps the heaviest set as the record', () => {
    expect(
      personalRecords([log('2026-10-01', 80), log('2026-10-05', 85)]).get('squat')?.weightKg,
    ).toBe(85)
  })
  it('returns the last sets before a date', () => {
    expect(
      previousSets([log('2026-10-01', 80), log('2026-10-05', 85)], 'squat', '2026-10-05')[0]
        ?.weightKg,
    ).toBe(80)
  })
})
