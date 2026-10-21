import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'neon'

export const themeColors: Record<Theme, string> = {
  light: '#f4f5f7',
  dark: '#0f1522',
  neon: '#06060a',
}

type ThemeState = { theme: Theme; setTheme: (theme: Theme) => void }

export const useTheme = create<ThemeState>()(
  persist((set) => ({ theme: 'light', setTheme: (theme) => set({ theme }) }), {
    name: 'pulsefit-settings',
  }),
)

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme])
}
