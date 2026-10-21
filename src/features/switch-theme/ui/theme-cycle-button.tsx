import { Icon, type IconName } from '@/shared/ui'
import { useTheme, type Theme } from '../model/theme'

const next: Record<Theme, Theme> = { light: 'dark', dark: 'neon', neon: 'light' }
const icon: Record<Theme, IconName> = { light: 'sun', dark: 'moon', neon: 'bolt' }

/** Header button: light → dark → neon. */
export function ThemeCycleButton() {
  const theme = useTheme((s) => s.theme)
  const setTheme = useTheme((s) => s.setTheme)
  return (
    <button
      type="button"
      onClick={() => setTheme(next[theme])}
      aria-label={`Theme: ${theme}. Switch to ${next[theme]}`}
      className="text-muted"
    >
      <Icon name={icon[theme]} />
    </button>
  )
}
