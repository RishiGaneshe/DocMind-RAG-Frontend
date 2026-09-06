import { Menu, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { IconButton, Kbd, Tooltip } from '@/components/ui'
import { Avatar } from '@/components/ui'
import { useDocuments } from '@/features/documents/hooks/useDocuments'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useUiStore } from '@/stores/uiStore'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

/**
 * The app's top edge: where you are, and the four things you always want.
 *
 * The breadcrumb is derived from the URL rather than passed down, so a page
 * cannot forget to set it and no page has to know about the shell.
 */

const SEGMENT_LABELS: Record<string, string> = {
  app: 'Chat',
  documents: 'Documents',
  upload: 'Upload',
  settings: 'Settings',
  workspace: 'Workspace',
  'api-keys': 'API key',
  members: 'Members',
  account: 'Account',
}

interface Crumb {
  label: string
  to?: string
}

function useCrumbs(): Crumb[] {
  const { pathname } = useLocation()
  const { documents } = useDocuments()

  const segments = pathname.split('/').filter(Boolean)
  const crumbs: Crumb[] = []
  let href = ''

  for (const [index, segment] of segments.entries()) {
    href += `/${segment}`
    const isLast = index === segments.length - 1

    // A path segment that is not in the map is an id — name it after the
    // document it points at, falling back to the raw id while the list loads.
    const known = SEGMENT_LABELS[segment]
    const label = known ?? documents.find((doc) => doc.id === segment)?.filename ?? 'Document'

    crumbs.push({ label, to: isLast ? undefined : href })
  }

  return crumbs
}

export function Topbar() {
  const setDrawerOpen = useUiStore((s) => s.setSidebarDrawerOpen)
  const togglePalette = useUiStore((s) => s.toggleCommandPalette)
  const user = useSessionStore((s) => s.user)
  const crumbs = useCrumbs()
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Account'

  return (
    <header className="sticky top-0 z-30 flex h-(--topbar-h) shrink-0 items-center gap-2 border-b border-line bg-surface-glass px-3 backdrop-blur-xl sm:px-4">
      <IconButton
        label="Open navigation"
        icon={<Menu />}
        size="sm"
        className="lg:hidden"
        aria-expanded={false}
        onClick={() => setDrawerOpen(true)}
      />

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-fg-disabled">
                  /
                </span>
              )}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="truncate rounded text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className={cn('truncate font-medium text-fg', index === 0 && 'text-fg')}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Wide enough to read as a search field on a laptop, an icon on a phone. */}
      <button
        type="button"
        onClick={togglePalette}
        className={cn(
          'hidden min-h-9 items-center gap-2 rounded-md border border-line bg-surface-raised px-2.5 text-sm text-fg-muted sm:inline-flex',
          'transition-colors duration-(--dur-fast) hover:border-line-strong hover:text-fg',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
        )}
      >
        <Search aria-hidden="true" className="size-4" />
        <span className="hidden md:inline">Search…</span>
        <Kbd className="ml-2 hidden md:inline-flex">⌘K</Kbd>
      </button>

      <Tooltip content="Search" shortcut="⌘K">
        <IconButton
          label="Open command palette"
          icon={<Search />}
          size="sm"
          className="sm:hidden"
          onClick={togglePalette}
        />
      </Tooltip>

      <ThemeToggle size="sm" />

      <UserMenu>
        <button
          type="button"
          aria-label={`Account menu for ${fullName}`}
          className="rounded-full transition-opacity duration-(--dur-fast) hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
        >
          <Avatar
            firstName={user?.firstName}
            lastName={user?.lastName}
            email={user?.email}
            size="sm"
          />
        </button>
      </UserMenu>
    </header>
  )
}
