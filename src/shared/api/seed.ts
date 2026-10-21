import { addDays, newId, toDateKey } from '../lib'
import {
  db,
  type BodyLog,
  type Exercise,
  type Food,
  type MealPlan,
  type Program,
  type WorkoutLog,
} from '../db'

export const DEMO_PROGRAM_ID = 'program-demo'
export const DEMO_PLAN_ID = 'plan-demo'

/** Libraries come from /data so the service worker can cache and refresh them. */
export async function refreshLibraries() {
  const [ex, fd] = await Promise.all([
    fetch('/data/exercises.json').then((r) => r.json() as Promise<{ exercises: Exercise[] }>),
    fetch('/data/foods.json').then((r) => r.json() as Promise<{ foods: Food[] }>),
  ])
  await db.transaction('rw', db.exercises, db.foods, async () => {
    await db.exercises.bulkPut(ex.exercises)
    await db.foods.bulkPut(fd.foods)
  })
}

const item = (exerciseId: string, sets: number, reps: number, weightKg: number, restSec = 120) => ({
  exerciseId,
  sets,
  reps,
  weightKg,
  restSec,
})

function demoProgram(start: Date): Program {
  return {
    id: DEMO_PROGRAM_ID,
    name: 'Strength base',
    weeks: 4,
    startDate: toDateKey(start),
    updatedAt: Date.now(),
    days: [
      {
        weekday: 1,
        title: 'Lower body A',
        items: [
          item('back-squat', 4, 6, 80, 150),
          item('romanian-deadlift', 3, 8, 60),
          item('walking-lunge', 3, 10, 14, 90),
          item('calf-raise', 3, 12, 40, 60),
        ],
      },
      {
        weekday: 2,
        title: 'Upper body A',
        items: [
          item('bench-press', 4, 8, 62.5),
          item('barbell-row', 4, 8, 55),
          item('overhead-press', 3, 10, 35, 90),
          item('lat-pulldown', 4, 12, 50, 75),
          item('face-pull', 3, 15, 15, 60),
        ],
      },
      {
        weekday: 4,
        title: 'Lower body B',
        items: [
          item('deadlift', 3, 5, 100, 180),
          item('leg-press', 3, 10, 120),
          item('plank', 3, 1, 0, 60),
        ],
      },
      {
        weekday: 6,
        title: 'Upper body B',
        items: [
          item('pull-up', 4, 6, 0),
          item('push-up', 3, 15, 0, 60),
          item('dumbbell-curl', 3, 12, 12, 60),
          item('triceps-pushdown', 3, 12, 25, 60),
        ],
      },
    ],
  }
}

const demoPlan: MealPlan = {
  id: DEMO_PLAN_ID,
  name: 'Lean bulk',
  goal: { kcal: 2200, protein: 150, carbs: 240, fat: 70 },
  updatedAt: 0,
  meals: [
    {
      slot: 'breakfast',
      items: [
        { foodId: 'oats', grams: 60 },
        { foodId: 'banana', grams: 118 },
        { foodId: 'greek-yogurt', grams: 200 },
      ],
    },
    {
      slot: 'lunch',
      items: [
        { foodId: 'chicken-breast', grams: 150 },
        { foodId: 'rice-white', grams: 200 },
        { foodId: 'broccoli', grams: 120 },
      ],
    },
    {
      slot: 'snack',
      items: [
        { foodId: 'apple', grams: 182 },
        { foodId: 'almonds', grams: 28 },
      ],
    },
    {
      slot: 'dinner',
      items: [
        { foodId: 'salmon', grams: 150 },
        { foodId: 'potato-boiled', grams: 250 },
        { foodId: 'spinach', grams: 60 },
      ],
    },
  ],
}

/** Three weeks of history so progress charts are not empty. Never sent to the server. */
function demoHistory(program: Program, today: Date) {
  const workouts: WorkoutLog[] = []
  const body: BodyLog[] = []
  for (let i = 21; i >= 1; i--) {
    const d = addDays(today, -i)
    const date = toDateKey(d)
    if (i % 2 === 1) {
      body.push({
        id: `body-${date}`,
        date,
        weightKg: Math.round((82.6 - (21 - i) * 0.07) * 10) / 10,
        waistCm: i > 10 ? 86 : 85,
      })
    }
    const day = program.days.find((x) => x.weekday === d.getDay())
    if (!day) continue
    const week = Math.floor((21 - i) / 7)
    const startedAt = d.setHours(18, 0, 0, 0)
    workouts.push({
      id: `workout-${date}`,
      date,
      programId: program.id,
      dayTitle: day.title,
      startedAt,
      finishedAt: startedAt + 50 * 60_000,
      sets: day.items.flatMap((it) =>
        Array.from({ length: it.sets }, (_, s) => ({
          exerciseId: it.exerciseId,
          set: s + 1,
          reps: it.reps,
          weightKg: Math.max(0, it.weightKg - (2 - week) * 2.5),
          doneAt: startedAt + s * 3 * 60_000,
        })),
      ),
    })
  }
  return { workouts, body }
}

export async function seedIfEmpty() {
  await refreshLibraries().catch(() => undefined)
  if (await db.meta.get('seeded')) return
  const today = new Date()
  const program = demoProgram(addDays(today, -21))
  const { workouts, body } = demoHistory(program, today)
  await db.transaction(
    'rw',
    [db.programs, db.mealPlans, db.workoutLogs, db.bodyLogs, db.notes, db.meta],
    async () => {
      await db.programs.put(program)
      await db.mealPlans.put({ ...demoPlan, updatedAt: Date.now() })
      await db.workoutLogs.bulkPut(workouts)
      await db.bodyLogs.bulkPut(body)
      await db.notes.put({
        id: newId(),
        text: 'Welcome to Pulsefit! Add 2.5 kg to bench if all sets felt easy last week.',
        createdAt: Date.now(),
      })
      await db.meta.put({ key: 'seeded', value: Date.now() })
    },
  )
}

/** Clears every table and seeds again (PWA status page). */
export async function resetDemoData() {
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) await t.clear()
  })
  await seedIfEmpty()
}
