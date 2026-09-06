import { Outlet, useLocation } from 'react-router'
import { PageTransition } from '@/components/motion'
import { CommandPalette } from './CommandPalette'
import { Sidebar, SidebarDrawer } from './Sidebar'
import { Topbar } from './Topbar'

/**
 * The signed-in shell (§12.4).
 *
 * The outer element is `h-dvh overflow-hidden` and `<main>` owns the only
 * scroll container. That is what lets the chat composer sit at the bottom edge
 * without `position: fixed` — and `dvh` rather than `vh` means the mobile URL
 * bar collapsing does not shove it off screen.
 */
export function AppLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex h-dvh overflow-hidden bg-bg-base">
      <Sidebar />
      <SidebarDrawer />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main id="main" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Keyed by pathname so React remounts it: the 200 ms rise reads as
              the new page arriving, and there is no exit animation to wait on. */}
          <PageTransition key={pathname} className="flex min-h-0 flex-1 flex-col">
            <Outlet />
          </PageTransition>
        </main>
      </div>

      <CommandPalette />
    </div>
  )
}
