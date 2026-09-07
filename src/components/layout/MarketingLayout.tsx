import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Logo } from '@/components/brand'
import { Button, Container, IconButton } from '@/components/ui'
import { useSession } from '@/features/auth/hooks/useSession'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { to: '/pricing', label: 'Pricing' },
  { to: '/legal/privacy', label: 'Privacy' },
  { to: '/legal/terms', label: 'Terms' },
]

const MENU_ID = 'marketing-menu'

const MOBILE_LINK =
  'rounded-md px-3 py-3 text-sm text-fg-secondary transition-colors duration-(--dur-fast) hover:bg-surface-raised hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)'

export function MarketingLayout() {
  const { isAuthenticated, tenantId } = useSession()
  const { pathname } = useLocation()

  // The panel belongs to the route it was opened on, so closing it on navigation
  // is derived during render rather than done in an effect: no second pass, and a
  // browser Back with the menu open lands closed too.
  const [menu, setMenu] = useState({ open: false, at: pathname })
  const open = menu.open && menu.at === pathname
  const setOpen = (next: boolean) => setMenu({ open: next, at: pathname })

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu((current) => ({ ...current, open: false }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const appHref = isAuthenticated ? (tenantId ? '/app' : '/onboarding/workspace') : '/login'

  return (
    <div className="flex min-h-dvh flex-col bg-bg-base">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-surface-glass backdrop-blur-xl">
        <Container className="flex h-(--topbar-h) items-center justify-between gap-4">
          <Logo to="/" />

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm transition-colors duration-(--dur-fast)',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
                    isActive ? 'text-fg' : 'text-fg-secondary hover:text-fg',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />

            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link to={appHref}>Open app</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}

            <IconButton
              label={open ? 'Close menu' : 'Open menu'}
              icon={open ? <X /> : <Menu />}
              size="sm"
              className="md:hidden"
              aria-expanded={open}
              aria-controls={MENU_ID}
              onClick={() => setOpen(!open)}
            />
          </div>
        </Container>

        {open && (
          <nav id={MENU_ID} aria-label="Main" className="border-t border-line bg-surface md:hidden">
            <Container className="flex flex-col py-2">
              {LINKS.map((link) => (
                <Link key={link.to} to={link.to} className={MOBILE_LINK}>
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link to="/login" className={cn(MOBILE_LINK, 'sm:hidden')}>
                  Sign in
                </Link>
              )}
            </Container>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line py-10">
        <Container className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Logo to="/" />
            <p className="max-w-xs text-sm text-fg-muted">
              Answers from your own documents, with the passage they came from attached.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-fg-secondary hover:text-fg">
                {link.label}
              </Link>
            ))}
            <Link to={appHref} className="text-fg-secondary hover:text-fg">
              {isAuthenticated ? 'Open app' : 'Sign in'}
            </Link>
          </nav>
        </Container>
      </footer>
    </div>
  )
}
