import { FileText, MessagesSquare, PanelLeftClose, PanelLeftOpen, Settings, Upload } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { Logo } from '@/components/brand'
import { Button, Drawer, DrawerContent, IconButton, Skeleton, Tooltip } from '@/components/ui'
import { useDocuments } from '@/features/documents/hooks/useDocuments'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useUiStore } from '@/stores/uiStore'
import { SidebarUserCard } from './SidebarUserCard'

/**
 * The app rail (§12.4, §16).
 *
 * One implementation serves two presentations: a persistent 280 px column from
 * `lg` up that collapses to a 64 px icon rail, and a left `Drawer` below it.
 * Rendering both and hiding one with CSS would put two copies of every link in
 * the accessibility tree, so the breakpoint is a *tree* decision, not a style.
 */

const NAV = [
  { to: '/app', label: 'Chat', icon: MessagesSquare, end: true },
  { to: '/app/documents', label: 'Documents', icon: FileText, end: false },
  { to: '/app/settings/workspace', label: 'Settings', icon: Settings, end: false },
] as const

const RECENT_LIMIT = 5

interface SidebarContentProps {
  collapsed: boolean
  /** Closes the drawer after a navigation. No-op for the persistent rail. */
  onNavigate?: () => void
}

function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  const tenant = useSessionStore((s) => s.tenant)
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)
  const { documents, isInitialLoading } = useDocuments()
  const recent = documents.slice(0, RECENT_LIMIT)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 py-4">
      <div className={cn('flex items-center gap-2 px-3', collapsed && 'flex-col')}>
        <Logo to="/app" markOnly={collapsed} className={collapsed ? '' : 'px-1'} />
        <div className="ml-auto hidden lg:block">
          <Tooltip content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="right">
            <IconButton
              label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              icon={collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              size="sm"
              onClick={toggleCollapsed}
              aria-expanded={!collapsed}
            />
          </Tooltip>
        </div>
      </div>

      {/* `asChild` renders the Link *as* the button, so the icon has to live in
          the children — Button's own leftIcon slot is bypassed by Slot. */}
      <div className={cn('px-3', collapsed && 'px-2')}>
        <Tooltip content={collapsed ? 'Upload document' : 'Upload a PDF'} side="right">
          <Button asChild fullWidth className={collapsed ? 'px-0' : undefined} onClick={onNavigate}>
            <Link to="/app/documents/upload">
              <Upload aria-hidden="true" className="size-4 shrink-0" />
              {collapsed ? <span className="sr-only">Upload document</span> : 'Upload document'}
            </Link>
          </Button>
        </Tooltip>
      </div>

      <nav aria-label="Workspace" className="px-2">
        <ul className="flex flex-col gap-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <SidebarLink to={to} end={end} collapsed={collapsed} label={label} onClick={onNavigate}>
                <Icon aria-hidden="true" className="size-5 shrink-0" />
              </SidebarLink>
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed && (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2">
          <p className="px-2 text-xs font-semibold tracking-[0.08em] text-fg-muted uppercase">
            Recent documents
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isInitialLoading ? (
              <div className="flex flex-col gap-2 px-2 py-1" aria-busy="true">
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
              </div>
            ) : recent.length === 0 ? (
              <p className="px-2 text-sm text-fg-muted text-pretty">
                Nothing uploaded yet. Answers are only as good as the corpus.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {recent.map((doc) => (
                  <li key={doc.id}>
                    <NavLink
                      to={`/app/documents/${doc.id}`}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-(--dur-fast)',
                          isActive
                            ? 'bg-accent-wash text-accent'
                            : 'text-fg-secondary hover:bg-surface-raised hover:text-fg',
                        )
                      }
                    >
                      <FileText aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                      <span className="truncate">{doc.filename}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className={cn('mt-auto px-2', collapsed && 'px-1.5')}>
        <SidebarUserCard collapsed={collapsed} tenantName={tenant?.name} onNavigate={onNavigate} />
      </div>
    </div>
  )
}

interface SidebarLinkProps {
  to: string
  end: boolean
  label: string
  collapsed: boolean
  children: React.ReactNode
  onClick?: () => void
}

function SidebarLink({ to, end, label, collapsed, children, onClick }: SidebarLinkProps) {
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-(--dur-fast)',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-accent-wash text-accent'
            : 'text-fg-secondary hover:bg-surface-raised hover:text-fg',
        )
      }
    >
      {children}
      {collapsed ? <span className="sr-only">{label}</span> : label}
    </NavLink>
  )

  if (!collapsed) return link
  return (
    <Tooltip content={label} side="right">
      {link}
    </Tooltip>
  )
}

/** The persistent rail. Rendered only at `lg` and up. */
export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 border-r border-line bg-bg-subtle transition-[width] duration-(--dur-base) ease-(--ease-out) lg:block',
        collapsed ? 'w-(--sidebar-collapsed-w)' : 'w-(--sidebar-w)',
      )}
    >
      <SidebarContent collapsed={collapsed} />
    </aside>
  )
}

/** The overlay presentation, below `lg`. Radix gives it the focus trap. */
export function SidebarDrawer() {
  const open = useUiStore((s) => s.sidebarDrawerOpen)
  const setOpen = useUiStore((s) => s.setSidebarDrawerOpen)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent
        side="left"
        title="Workspace navigation"
        hideHeader
        className="bg-bg-subtle"
        aria-describedby={undefined}
      >
        <SidebarContent collapsed={false} onNavigate={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  )
}
