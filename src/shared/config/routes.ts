export const routes = {
  athlete: {
    today: '/athlete',
    workout: '/athlete/workout',
    diet: '/athlete/diet',
    progress: '/athlete/progress',
  },
  coach: {
    athletes: '/coach',
    programs: '/coach/programs',
    mealPlans: '/coach/meal-plans',
    library: '/coach/library',
  },
  status: '/status',
} as const

export type Role = 'athlete' | 'coach'
