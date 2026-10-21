import { createBrowserRouter, Navigate } from 'react-router'
import { AthletesPage } from '@/pages/athletes'
import { DietPage } from '@/pages/diet'
import { LibraryPage } from '@/pages/library'
import { MealPlansPage } from '@/pages/meal-plans'
import { ProgramsPage } from '@/pages/programs'
import { ProgressPage } from '@/pages/progress'
import { PwaStatusPage } from '@/pages/pwa-status'
import { TodayPage } from '@/pages/today'
import { WorkoutPage } from '@/pages/workout'
import { routes } from '@/shared/config'
import { AppShell } from '@/widgets/app-shell'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Navigate to={routes.athlete.today} replace /> },
      { path: routes.athlete.today, element: <TodayPage /> },
      { path: routes.athlete.workout, element: <WorkoutPage /> },
      { path: routes.athlete.diet, element: <DietPage /> },
      { path: routes.athlete.progress, element: <ProgressPage /> },
      { path: routes.coach.athletes, element: <AthletesPage /> },
      { path: routes.coach.programs, element: <ProgramsPage /> },
      { path: routes.coach.mealPlans, element: <MealPlansPage /> },
      { path: routes.coach.library, element: <LibraryPage /> },
      { path: routes.status, element: <PwaStatusPage /> },
      { path: '*', element: <Navigate to={routes.athlete.today} replace /> },
    ],
  },
])
