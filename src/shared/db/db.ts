import Dexie, { type EntityTable } from 'dexie'
import type {
  BodyLog,
  Exercise,
  Food,
  MealLog,
  MealPlan,
  Note,
  OutboxEntry,
  Program,
  WorkoutLog,
} from './types'

// One database shared by both roles and by the service worker.
export class PulsefitDb extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>
  foods!: EntityTable<Food, 'id'>
  programs!: EntityTable<Program, 'id'>
  mealPlans!: EntityTable<MealPlan, 'id'>
  workoutLogs!: EntityTable<WorkoutLog, 'id'>
  mealLogs!: EntityTable<MealLog, 'id'>
  bodyLogs!: EntityTable<BodyLog, 'id'>
  notes!: EntityTable<Note, 'id'>
  outbox!: EntityTable<OutboxEntry, 'seq'>
  meta!: EntityTable<{ key: string; value: unknown }, 'key'>

  constructor() {
    super('pulsefit')
    this.version(1).stores({
      exercises: 'id, muscle',
      foods: 'id, &barcode',
      programs: 'id',
      mealPlans: 'id',
      workoutLogs: 'id, date',
      mealLogs: 'id, date',
      bodyLogs: 'id, date',
      notes: 'id, createdAt',
      outbox: '++seq, createdAt',
      meta: 'key',
    })
  }
}

export const db = new PulsefitDb()
