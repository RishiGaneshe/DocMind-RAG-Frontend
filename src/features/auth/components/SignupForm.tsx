import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import { Alert, Button, Checkbox, Input } from '@/components/ui'
import { ApiError } from '@/lib/api'
import { PASSWORD_MIN } from '@/lib/constants'
import { useSignup } from '../hooks/useAuthMutations'
import { signupSchema, type SignupValues } from '../schemas'
import { AuthCard, AuthFooterLink } from './AuthCard'
import { PasswordField } from './PasswordField'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'

type Banner = { tone: 'error' | 'warning'; title: string; message: string; retry?: boolean }

const LINK =
  'rounded font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)'

export function SignupForm() {
  const navigate = useNavigate()
  const signup = useSignup()
  const [banner, setBanner] = useState<Banner | null>(null)
  const [takenEmail, setTakenEmail] = useState<string | null>(null)

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  const password = form.watch('password')
  const busy = signup.isPending

  const submit = form.handleSubmit(async (values) => {
    setBanner(null)
    setTakenEmail(null)

    try {
      await signup.mutateAsync(values)
      await navigate('/onboarding/workspace', { replace: true })
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setBanner({
          tone: 'error',
          title: 'We could not create your account',
          message: 'Something unexpected went wrong. Please try again.',
        })
        return
      }

      if (error.status === 409) {
        setTakenEmail(values.email)
        form.setError('email', { message: 'An account already uses this email address.' })
        form.setFocus('email')
        return
      }

      if (error.status === 400) {
        setBanner({ tone: 'error', title: 'Check your details', message: error.message })
        return
      }

      if (error.status === 429) {
        setBanner({ tone: 'warning', title: 'Too many attempts', message: error.message })
        return
      }

      setBanner({
        tone: 'error',
        title: error.isNetworkError
          ? 'We could not reach the server'
          : 'We could not create your account',
        message: error.message,
        retry: true,
      })
    }
  })

  return (
    <AuthCard
      title="Create your account"
      description="Set up a workspace and start asking your documents questions."
      footer={<AuthFooterLink prompt="Already have an account?" to="/login" label="Sign in" />}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            autoComplete="given-name"
            autoFocus
            readOnly={busy}
            required
            error={form.formState.errors.firstName?.message}
            {...form.register('firstName')}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            readOnly={busy}
            required
            error={form.formState.errors.lastName?.message}
            {...form.register('lastName')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            label="Work email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            readOnly={busy}
            required
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />
          {takenEmail && (
            <p className="text-xs text-fg-muted">
              <Link to={`/login?email=${encodeURIComponent(takenEmail)}`} className={LINK}>
                Sign in instead
              </Link>{' '}
              with that address.
            </p>
          )}
        </div>

        <PasswordField
          label="Password"
          autoComplete="new-password"
          readOnly={busy}
          required
          hint={`At least ${PASSWORD_MIN} characters.`}
          error={form.formState.errors.password?.message}
          footer={<PasswordStrengthMeter value={password} />}
          {...form.register('password')}
        />

        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          readOnly={busy}
          required
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />

        <Controller
          control={form.control}
          name="terms"
          render={({ field, fieldState }) => (
            <Checkbox
              label={
                <>
                  I agree to the{' '}
                  <Link to="/legal/terms" className={LINK}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/legal/privacy" className={LINK}>
                    Privacy Policy
                  </Link>
                  .
                </>
              }
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              name={field.name}
              disabled={busy}
              error={fieldState.error?.message}
            />
          )}
        />

        <Button type="submit" size="lg" fullWidth loading={busy}>
          {busy ? 'Creating your account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
