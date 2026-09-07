import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { Alert, Button, Dialog, DialogContent } from '@/components/ui'
import { ApiError } from '@/lib/api'
import { tokenStorage } from '@/lib/tokenStorage'
import { useSessionStore } from '@/stores/sessionStore'
import { useLogin } from '../hooks/useAuthMutations'
import { PasswordField } from './PasswordField'

const schema = z.object({ password: z.string().min(1, 'Enter your password.') })
type Values = z.infer<typeof schema>

export function SessionExpiredDialog() {
  const expired = useSessionStore((s) => s.expired)
  const user = useSessionStore((s) => s.user)
  const endExpiredSession = useSessionStore((s) => s.endExpiredSession)
  const isAuthenticated = useSessionStore((s) => s.status === 'authenticated')
  const navigate = useNavigate()
  const login = useLogin()
  const [failed, setFailed] = useState<string | null>(null)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  })

  if (!expired || !user || !isAuthenticated) return null

  const signOutAndLeave = () => {
    const next = `${window.location.pathname}${window.location.search}`
    endExpiredSession()
    void navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true })
  }

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setFailed(null)
    try {
      // Keep the store the original sign-in chose: someone who deliberately
      // did not tick "remember me" should not be silently switched to
      // localStorage just because their token expired.
      await login.mutateAsync({
        email: user.email,
        password,
        remember: tokenStorage.isPersistent(),
      })
      form.reset()
    } catch (error) {
      setFailed(
        error instanceof ApiError ? error.message : 'Could not sign you in. Please try again.',
      )
    }
  })

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) signOutAndLeave()
      }}
    >
      <DialogContent
        size="sm"
        title="Your session expired"
        description="Sign in again to pick up exactly where you left off. Nothing on this page has been lost."
        hideClose
        // Focus the password field rather than the first control, and do not
        // let a stray click outside dismiss work in progress.
        onInteractOutside={(event) => event.preventDefault()}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {failed && (
            <Alert tone="error" title="Sign-in failed">
              {failed}
            </Alert>
          )}

          <div className="rounded-md border border-line bg-bg-subtle px-3 py-2 text-sm text-fg-secondary">
            Signed in as <span className="font-medium text-fg">{user.email}</span>
          </div>

          <PasswordField
            label="Password"
            autoComplete="current-password"
            autoFocus
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={signOutAndLeave}>
              Sign out instead
            </Button>
            <Button type="submit" loading={login.isPending}>
              Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
