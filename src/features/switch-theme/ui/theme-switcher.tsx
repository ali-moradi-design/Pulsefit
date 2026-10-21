import { Segmented } from '@/shared/ui'
import { useTheme, type Theme } from '../model/theme'

const options = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'neon', label: 'Neon' },
] as const satisfies ReadonlyArray<{ value: Theme; label: string }>

export function ThemeSwitcher() {
  const theme = useTheme((s) => s.theme)
  const setTheme = useTheme((s) => s.setTheme)
  return <Segmented label="Theme" value={theme} options={options} onChange={setTheme} />
}
