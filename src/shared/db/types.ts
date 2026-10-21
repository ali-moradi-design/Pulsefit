export type Muscle = 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core'

export type Exercise = {
  id: string
  name: string
  muscle: Muscle
  equipment: string
  cue: string
}

export type Macros = { kcal: number; protein: number; carbs: number; fat: number }

export type Food = {
  id: string
  name: string
  barcode: string
  per100g: Macros
  serving: { label: string; grams: number }
}

export type ProgramItem = {
  exerciseId: string
  sets: number
  reps: number
  restSec: number
  weightKg: number
}

/** weekday: 0 = Sunday … 6 = Saturday, like Date.getDay(). */
export type ProgramDay = { weekday: number; title: string; items: ProgramItem[] }

export type Program = {
  id: string
  name: string
  weeks: number
  startDate: string
  days: ProgramDay[]
  updatedAt: number
}

export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner'

export type MealPlan = {
  id: string
  name: string
  goal: Macros
  meals: Array<{ slot: MealSlot; items: Array<{ foodId: string; grams: number }> }>
  updatedAt: number
}

export type LoggedSet = {
  exerciseId: string
  set: number
  reps: number
  weightKg: number
  doneAt: number
}

export type WorkoutLog = {
  id: string
  date: string
  programId: string
  dayTitle: string
  sets: LoggedSet[]
  startedAt: number
  finishedAt?: number
}

export type MealLog = {
  id: string
  date: string
  slot: MealSlot
  foodId: string
  grams: number
  macros: Macros
  loggedAt: number
}

export type BodyLog = { id: string; date: string; weightKg: number; waistCm?: number }

export type Note = { id: string; text: string; createdAt: number; readAt?: number }

export type SyncedRecords = {
  programs: Program
  mealPlans: MealPlan
  workoutLogs: WorkoutLog
  mealLogs: MealLog
  bodyLogs: BodyLog
  notes: Note
}

export type SyncedTable = keyof SyncedRecords

export type OutboxEntry = {
  seq?: number
  table: SyncedTable
  op: 'put' | 'delete'
  key: string
  value?: unknown
  createdAt: number
  attempts: number
}
