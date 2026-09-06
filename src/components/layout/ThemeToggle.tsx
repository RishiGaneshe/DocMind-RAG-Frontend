import { Monitor, Moon, Sun } from 'lucide-react'
import { IconButton, Tooltip } from '@/components/ui'
import { useUiStore } from '@/stores/uiStore'

/**
 * A three-state toggle: system → dark → light → system.
 *
 * A two-state switch would silently drop the "follow the OS" option, which is
 * the default and the one most people actually want. The button's accessible
 * name always says what the *next* press will do.
 */

const NEXT = { system: 'dark', dark: 'light', light: 'system' } as const

export function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const next = NEXT[theme]

  const icon = theme === 'system' ? <Monitor /> : theme === 'dark' ? <Moon /> : <Sun />
  const label = `Theme: ${theme}. Switch to ${next}.`

  return (
    <Tooltip content={label}>
      <IconButton label={label} icon={icon} size={size} onClick={() => setTheme(next)} />
    </Tooltip>
  )
}
