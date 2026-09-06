import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { Outlet, ScrollRestoration } from 'react-router'
import { TooltipProvider } from '@/components/ui'
import { Toaster } from '@/components/feedback'
import { SessionExpiredDialog } from '@/features/auth/components/SessionExpiredDialog'
import { useSessionBootstrap } from '@/features/auth/hooks/useSession'
import { queryClient } from '@/lib/queryClient'

/**
 * Everything every route needs, mounted once.
 *
 * The session probe starts here rather than in a guard, so a public page and a
 * protected one both know who the visitor is by the time they paint — that is
 * what lets the landing header show "Go to workspace" instead of "Start free"
 * without a flash.
 *
 * `reducedMotion="user"` is set once for the whole app (§17.3); no component
 * below this point checks the media query in order to animate correctly.
 */
export function RootLayout() {
  useSessionBootstrap()

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={250} skipDelayDuration={300}>
          <a href="#main" className="skip-link">
            Skip to main content
          </a>

          <Outlet />

          <Toaster />
          {/* Re-authentication happens over the top of whatever is on screen,
              never by redirecting away from it (§11.1). */}
          <SessionExpiredDialog />
          <ScrollRestoration />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  )
}
