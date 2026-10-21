import { createBrowserRouter, Navigate } from 'react-router'
import { routes } from '@/shared/config'
import { AppShell } from '@/widgets/app-shell'

// Each page is its own chunk; the service worker precaches all of them for offline use.
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    HydrateFallback: () => null,
    children: [
      { path: '/', element: <Navigate to={routes.athlete.today} replace /> },
      {
        path: routes.athlete.today,
        lazy: async () => ({ Component: (await import('@/pages/today')).TodayPage }),
      },
      {
        path: routes.athlete.workout,
        lazy: async () => ({ Component: (await import('@/pages/workout')).WorkoutPage }),
      },
      {
        path: routes.athlete.diet,
        lazy: async () => ({ Component: (await import('@/pages/diet')).DietPage }),
      },
      {
        path: routes.athlete.progress,
        lazy: async () => ({ Component: (await import('@/pages/progress')).ProgressPage }),
      },
      {
        path: routes.coach.athletes,
        lazy: async () => ({ Component: (await import('@/pages/athletes')).AthletesPage }),
      },
      {
        path: routes.coach.programs,
        lazy: async () => ({ Component: (await import('@/pages/programs')).ProgramsPage }),
      },
      {
        path: routes.coach.mealPlans,
        lazy: async () => ({ Component: (await import('@/pages/meal-plans')).MealPlansPage }),
      },
      {
        path: routes.coach.library,
        lazy: async () => ({ Component: (await import('@/pages/library')).LibraryPage }),
      },
      {
        path: routes.status,
        lazy: async () => ({ Component: (await import('@/pages/pwa-status')).PwaStatusPage }),
      },
      { path: '*', element: <Navigate to={routes.athlete.today} replace /> },
    ],
  },
])
