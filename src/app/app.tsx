import { RouterProvider } from 'react-router'
import { ThemeSync } from './theme/theme-sync'
import { router } from './router/router'

export function App() {
  return (
    <>
      <ThemeSync />
      <RouterProvider router={router} />
    </>
  )
}
