import { LogOut } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router'
import { Logo } from '@/components/brand'
import { FadeIn, OrbBackdrop } from '@/components/motion'
import { Button } from '@/components/ui'
import { useLogout } from '@/features/auth/hooks/useAuthMutations'
import { ThemeToggle } from './ThemeToggle'

export function OnboardingLayout() {
  const navigate = useNavigate()
  const logout = useLogout()

  return (
    <div className="relative flex min-h-dvh flex-col overflow-y-auto bg-bg-base">
      <OrbBackdrop subtle />

      <header className="relative flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo to="/" />
        <div className="flex items-center gap-1">
          <ThemeToggle size="sm" />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<LogOut />}
            loading={logout.isPending}
            onClick={() => {
              logout.mutate(undefined, {
                onSuccess: () => void navigate('/login', { replace: true }),
              })
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main
        id="main"
        className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6"
      >
        <FadeIn className="w-full max-w-xl">
          <Outlet />
        </FadeIn>
      </main>
    </div>
  )
}
