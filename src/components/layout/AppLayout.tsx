import { Outlet, useLocation } from 'react-router'
import { PageTransition } from '@/components/motion'
import { CommandPalette } from './CommandPalette'
import { Sidebar, SidebarDrawer } from './Sidebar'
import { Topbar } from './Topbar'

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
