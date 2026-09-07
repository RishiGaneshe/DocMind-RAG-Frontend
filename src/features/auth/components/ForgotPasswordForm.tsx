import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Input } from '@/components/ui'
import { ApiError } from '@/lib/api'
import { useForgotPassword } from '../hooks/useAuthMutations'
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas'
import { AuthCard, AuthFooterLink } from './AuthCard'

export function ForgotPasswordForm() {
  const request = useForgotPassword()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  })

  const submit = form.handleSubmit(async (values) => {
    setError(null)
    try {
      await request.mutateAsync(values)
      setSentTo(values.email)
    } catch (caught) {
      // A 404 means "unknown address" — deliberately reported as success.
      if (caught instanceof ApiError && caught.status === 404) {
        setSentTo(values.email)
        return
      }
      setError(
        caught instanceof ApiError ? caught.message : 'Something went wrong. Please try again.',
      )
    }
  })

  if (sentTo) {
    return (
      <AuthCard
        title="Check your inbox"
        footer={<AuthFooterLink prompt="Remembered it?" to="/login" label="Back to sign in" />}
      >
        <Alert tone="success" title="If that address has an account, a reset link is on its way.">
          We sent it to <span className="font-medium text-fg">{sentTo}</span>. The link expires in
          one hour — check your spam folder if it has not arrived in a few minutes.
        </Alert>
        <Button variant="secondary" fullWidth onClick={() => setSentTo(null)}>
          Use a different email
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email you signed up with and we will send you a reset link."
      footer={<AuthFooterLink prompt="Remembered it?" to="/login" label="Back to sign in" />}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {error && (
          <Alert tone="error" title="We could not send the link">
            {error}
          </Alert>
        )}

        <Input
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          readOnly={request.isPending}
          required
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />

        <Button type="submit" size="lg" fullWidth loading={request.isPending}>
          {request.isPending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthCard>
  )
}
