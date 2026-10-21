import { useEffect } from 'react'
import { applyTheme, useTheme } from '@/features/switch-theme'

export function ThemeSync() {
  const theme = useTheme((s) => s.theme)
  useEffect(() => applyTheme(theme), [theme])
  return null
}
