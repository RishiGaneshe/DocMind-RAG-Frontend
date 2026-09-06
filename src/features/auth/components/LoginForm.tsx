import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Alert, Button, Checkbox, Input } from '@/components/ui'
import { ApiError } from '@/lib/api'
import { FEATURES } from '@/lib/constants'
import { useLogin } from '../hooks/useAuthMutations'
import { loginSchema, type LoginValues } from '../schemas'
import { AuthCard, AuthFooterLink } from './AuthCard'
import { ForgotPasswordDialog } from './ForgotPasswordDialog'
import { PasswordField } from './PasswordField'
import { safeNext } from './PublicOnlyRoute'

/**
 * Sign-in (§13.1).
 *
 * Submit is never disabled on invalid input: a greyed-out button does not say
 * *why* it cannot be pressed, whereas a submit that reveals the field errors
 * does. And the 401 message is deliberately identical for "no such user" and
 * "wrong password" — anything else is an account-enumeration oracle.
 */

type Banner = { tone: 'error' | 'warning'; title: string; message: string; retry?: boolean }

export function LoginForm() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const login = useLogin()
  const [banner, setBanner] = useState<Banner | null>(null)
  const [badCredentials, setBadCredentials] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      // Carried over from the signup page's "sign in instead" link.
      email: params.get('email') ?? '',
      password: '',
      remember: true,
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setBanner(null)
    setBadCredentials(false)

    try {
      const { user } = await login.mutateAsync(values)
      const next = safeNext(params.get('next'))
      // A user with no workspace cannot land in /app — it would bounce them
      // straight to onboarding anyway, so send them there directly.
      await navigate(user.tenantId ? (next ?? '/app') : '/onboarding/workspace', { replace: true })
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setBanner({
          tone: 'error',
          title: 'Sign-in failed',
          message: 'Something unexpected went wrong. Please try again.',
        })
        return
      }

      if (error.status === 401) {
        setBadCredentials(true)
        form.resetField('password')
        form.setFocus('password')
        setBanner({
          tone: 'error',
          title: 'That email or password is incorrect',
          message: 'Check both fields and try again.',
        })
        return
      }

      if (error.status === 429) {
        setBanner({ tone: 'warning', title: 'Too many attempts', message: error.message })
        return
      }

      setBanner({
        tone: 'error',
        title: error.isNetworkError ? 'We could not reach the server' : 'Sign-in failed',
        message: error.message,
        retry: true,
      })
    }
  })

  const busy = login.isPending

  return (
    <AuthCard
      title="Sign in"
      description="Pick up where you left off with your workspace."
      footer={<AuthFooterLink prompt="New to DocMind?" to="/signup" label="Create an account" />}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {banner && (
          <Alert
            tone={banner.tone}
            title={banner.title}
            action={
              banner.retry ? (
                <Button size="sm" variant="secondary" onClick={() => void submit()}>
                  Retry
                </Button>
              ) : undefined
            }
          >
            {banner.message}
          </Alert>
        )}

        <Input
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          readOnly={busy}
          error={form.formState.errors.email?.message}
          aria-invalid={badCredentials || undefined}
          className={badCredentials ? 'border-error' : undefined}
          {...form.register('email')}
        />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          readOnly={busy}
          error={form.formState.errors.password?.message}
          aria-invalid={badCredentials || undefined}
          className={badCredentials ? 'border-error' : undefined}
          {...form.register('password')}
        />

        <div className="flex items-center justify-between gap-3">
          <Controller
            control={form.control}
            name="remember"
            render={({ field }) => (
              <Checkbox
                label="Remember me"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                name={field.name}
                disabled={busy}
              />
            )}
          />

          {FEATURES.passwordReset ? (
            <Link
              to="/forgot-password"
              className="rounded text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
            >
              Forgot password?
            </Link>
          ) : (
            // No endpoint exists yet, so an honest dialog beats a dead form.
            <ForgotPasswordDialog />
          )}
        </div>

        <Button type="submit" size="lg" fullWidth loading={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  )
}
