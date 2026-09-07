import { KeyRound, Building2, MessageSquare, User, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { Container } from '@/components/ui'
import { useDocumentTitle } from '@/hooks'
import { cn } from '@/lib/utils'

const PANES = [
  { to: '/app/settings/workspace', label: 'Workspace', icon: <Building2 /> },
  { to: '/app/settings/api-keys', label: 'API keys', icon: <KeyRound /> },
  { to: '/app/settings/widget', label: 'Chat widget', icon: <MessageSquare /> },
  { to: '/app/settings/members', label: 'Members', icon: <Users /> },
  { to: '/app/settings/account', label: 'Account', icon: <User /> },
]

export default function SettingsPage() {
  useDocumentTitle('Settings')

  return (
    <Container width="lg" className="flex flex-col gap-6 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-fg">Settings</h1>
        <p className="text-sm text-fg-muted">
          Your workspace, your key and your account. Most of it is read-only — the API exposes no
          update routes yet.
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[200px_1fr] lg:items-start lg:gap-8">
        <nav aria-label="Settings sections" className="-mx-4 px-4 lg:mx-0 lg:px-0">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {PANES.map((pane) => (
              <li key={pane.to} className="shrink-0 lg:shrink">
                <NavLink
                  to={pane.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors duration-(--dur-fast)',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
                      '[&_svg]:size-4 [&_svg]:shrink-0',
                      isActive
                        ? 'bg-accent-wash font-medium text-accent'
                        : 'text-fg-secondary hover:bg-surface-raised hover:text-fg',
                    )
                  }
                >
                  {pane.icon}
                  {pane.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </Container>
  )
}
