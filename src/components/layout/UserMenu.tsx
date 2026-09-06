import { KeyRound, LogOut, Monitor, Moon, Settings, Sun, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { useLogout } from '@/features/auth/hooks/useAuthMutations'
import { useSessionStore } from '@/stores/sessionStore'
import { useUiStore, type ThemePreference } from '@/stores/uiStore'

/**
 * The account menu, shared by the topbar avatar and the sidebar user card so
 * the two can never offer different actions.
 *
 * Navigation happens with `useNavigate` rather than `<Link>` children because
 * Radix menu items are `role="menuitem"` — nesting an anchor inside one gives
 * screen readers two names for a single control.
 */

const THEMES: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: 'system', label: 'System', icon: <Monitor /> },
  { value: 'dark', label: 'Dark', icon: <Moon /> },
  { value: 'light', label: 'Light', icon: <Sun /> },
]

interface UserMenuProps {
  /** The trigger. Must accept a ref — it is rendered with `asChild`. */
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function UserMenu({ children, align = 'end', side = 'bottom' }: UserMenuProps) {
  const user = useSessionStore((s) => s.user)
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const logout = useLogout()
  const navigate = useNavigate()

  const signOut = () => {
    logout.mutate(undefined, {
      // The store clears credentials either way; the redirect is what the user
      // sees, so it must not depend on the revoke call succeeding.
      onSettled: () => void navigate('/login', { replace: true }),
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-60">
        {/* The shared label style is an uppercase eyebrow; a person's name and
            email are not, so this one opts out. */}
        <DropdownMenuLabel className="text-sm tracking-normal normal-case">
          <span className="block truncate font-medium text-fg">
            {user ? `${user.firstName} ${user.lastName}`.trim() : 'Signed in'}
          </span>
          <span className="block truncate text-xs font-normal text-fg-muted">{user?.email}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => void navigate('/app/settings/account')}>
            <UserIcon aria-hidden="true" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void navigate('/app/settings/workspace')}>
            <Settings aria-hidden="true" />
            Workspace settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void navigate('/app/settings/api-keys')}>
            <KeyRound aria-hidden="true" />
            API key
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as ThemePreference)}
        >
          {THEMES.map(({ value, label, icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <span className="inline-flex items-center gap-2.5">
                {icon}
                {label}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem tone="danger" onSelect={signOut}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
