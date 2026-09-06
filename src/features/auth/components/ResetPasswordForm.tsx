import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Alert, Button } from '@/components/ui'
import { ApiError } from '@/lib/api'
import { PASSWORD_MIN } from '@/lib/constants'
import { useResetPassword } from '../hooks/useAuthMutations'
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas'
import { AuthCard, AuthFooterLink } from './AuthCard'
import { PasswordField } from './PasswordField'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'

/**
 * Choose a new password (§13.3). Feature-flagged alongside ForgotPasswordForm.
 *
 * The token lives in the query string, so the whole screen has to cope with it
 * being absent, malformed or expired — three states that all resolve to "start
 * again", with a link that actually does.
 */
export function ResetPasswordForm() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const reset = useResetPassword()
  const token = params.get('token')
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: { password: '', confirmPassword: '' },
  })

  const password = form.watch('password')

  const submit = form.handleSubmit(async (values) => {
    if (!token) return
    setError(null)
    try {
      await reset.mutateAsync({ token, password: values.password })
      // Straight to sign-in: the old session's tokens are no longer valid.
      await navigate('/login?reset=1', { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError && (caught.status === 400 || caught.status === 410)) {
        setExpired(true)
        return
      }
      setError(
        caught instanceof ApiError ? caught.message : 'Something went wrong. Please try again.',
      )
    }
  })

  if (!token || expired) {
    return (
      <AuthCard
        title="This link has expired"
        footer={<AuthFooterLink prompt="Know your password?" to="/login" label="Sign in" />}
      >
        <Alert tone="warning" title="Reset links are valid for one hour">
          Request a new one and use the most recent email — older links stop working as soon as a
          newer one is issued.
        </Alert>
        <Button asChild size="lg" fullWidth>
          <Link to="/forgot-password">Request a new link</Link>
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Pick something you have not used here before."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {error && (
          <Alert tone="error" title="We could not update your password">
            {error}
          </Alert>
        )}

        <PasswordField
          label="New password"
          autoComplete="new-password"
          autoFocus
          readOnly={reset.isPending}
          required
          hint={`At least ${PASSWORD_MIN} characters.`}
          error={form.formState.errors.password?.message}
          footer={<PasswordStrengthMeter value={password} />}
          {...form.register('password')}
        />

        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          readOnly={reset.isPending}
          required
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />

        <Button type="submit" size="lg" fullWidth loading={reset.isPending}>
          {reset.isPending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthCard>
  )
}
