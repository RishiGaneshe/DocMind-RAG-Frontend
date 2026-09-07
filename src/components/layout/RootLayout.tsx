import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { Outlet, ScrollRestoration } from 'react-router'
import { TooltipProvider } from '@/components/ui'
import { Toaster } from '@/components/feedback'
import { SessionExpiredDialog } from '@/features/auth/components/SessionExpiredDialog'
import { useSessionBootstrap } from '@/features/auth/hooks/useSession'
import { queryClient } from '@/lib/queryClient'

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
          <SessionExpiredDialog />
          <ScrollRestoration />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  )
}
