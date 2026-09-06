import { ChevronsUpDown } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { UserMenu } from './UserMenu'

/**
 * The bottom block of the sidebar: who you are and which workspace you are in.
 *
 * The workspace name lives here rather than in the topbar because it is
 * identity, not navigation — and on a laptop the topbar is the scarcer space.
 */

interface SidebarUserCardProps {
  collapsed: boolean
  tenantName?: string
  onNavigate?: () => void
}

export function SidebarUserCard({ collapsed, tenantName }: SidebarUserCardProps) {
  const user = useSessionStore((s) => s.user)
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Account'

  return (
    <UserMenu align={collapsed ? 'center' : 'start'} side={collapsed ? 'right' : 'top'}>
      <button
        type="button"
        aria-label={`Account menu for ${fullName}`}
        className={cn(
          'flex w-full min-h-11 items-center gap-2.5 rounded-md border border-transparent p-2 text-left',
          'transition-colors duration-(--dur-fast) hover:border-line hover:bg-surface-raised',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
          collapsed && 'justify-center p-1.5',
        )}
      >
        <Avatar
          firstName={user?.firstName}
          lastName={user?.lastName}
          email={user?.email}
          size="sm"
        />
        {!collapsed && (
          <>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-fg">{fullName}</span>
              <span className="truncate text-xs text-fg-muted">
                {tenantName ?? 'No workspace'}
              </span>
            </span>
            <ChevronsUpDown aria-hidden="true" className="ml-auto size-4 shrink-0 text-fg-muted" />
          </>
        )}
      </button>
    </UserMenu>
  )
}
