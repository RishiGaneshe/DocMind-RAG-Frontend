import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Building2, Check, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { Alert, Button, Card, CardBody, Input } from '@/components/ui'
import { ApiError, createTenant, type Tenant } from '@/lib/api'
import { TENANT_SLUG_MAX } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { workspaceSchema, type WorkspaceValues } from '../schemas'

export function WorkspaceForm() {
  const navigate = useNavigate()
  const adoptWorkspace = useSessionStore((s) => s.adoptWorkspace)
  const [step, setStep] = useState<1 | 2>(1)
  const [banner, setBanner] = useState<string | null>(null)
  const slugEdited = useRef(false)

  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    mode: 'onBlur',
    defaultValues: { name: '', slug: '' },
  })

  const create = useMutation<
    { tenant: Tenant; accessToken: string; refreshToken: string },
    ApiError,
    WorkspaceValues
  >({
    mutationFn: (values) => createTenant(values),
    onSuccess: (payload) => {
      // The new pair carries the tenant claim; the old one 403s everywhere.
      adoptWorkspace(payload)
    },
  })

  const values = form.watch()

  const toReview = form.handleSubmit(() => {
    setBanner(null)
    setStep(2)
  })

  const submit = async () => {
    setBanner(null)
    try {
      await create.mutateAsync(form.getValues())
      // Straight to upload: a workspace with no documents cannot answer anything.
      await navigate('/app/documents/upload', { replace: true })
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setBanner('Something unexpected went wrong. Please try again.')
        return
      }

      if (error.status === 409) {
        setStep(1)
        form.setError('slug', {
          message: 'That address is taken. Try adding a word to make it unique.',
        })
        form.setFocus('slug')
        return
      }

      if (error.status === 400) {
        setStep(1)
        setBanner(error.message)
        return
      }

      setBanner(
        error.isNetworkError
          ? 'Could not reach the server. Check your connection and try again.'
          : error.message,
      )
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <ol className="flex items-center gap-3 text-sm" aria-label="Progress">
        <StepDot index={1} current={step} label="Name it" />
        <li aria-hidden="true" className="h-px flex-1 bg-line" />
        <StepDot index={2} current={step} label="Confirm" />
      </ol>

      <Card>
        <CardBody className="flex flex-col gap-5">
          {banner && (
            <Alert tone="error" title="The workspace was not created">
              {banner}
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={toReview} noValidate className="flex flex-col gap-5">
              <header className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold text-fg">Create your workspace</h1>
                <p className="text-sm text-fg-muted">
                  Documents, passages and answers all live inside a workspace. Yours is separate
                  from everyone else's.
                </p>
              </header>

              <Input
                label="Workspace name"
                autoFocus
                required
                placeholder="Acme Research"
                hint="Usually your company or team name."
                error={form.formState.errors.name?.message}
                {...form.register('name', {
                  onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                    if (slugEdited.current) return
                    form.setValue('slug', slugify(event.target.value, TENANT_SLUG_MAX), {
                      shouldValidate: form.formState.isSubmitted,
                    })
                  },
                })}
              />

              <Input
                label="Workspace address"
                required
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="font-mono"
                placeholder="acme-research"
                hint="Lowercase letters, numbers and hyphens. This cannot be changed later."
                error={form.formState.errors.slug?.message}
                {...form.register('slug', {
                  onChange: () => {
                    slugEdited.current = true
                  },
                })}
              />

              <p className="rounded-md border border-line bg-surface-raised px-3 py-2 font-mono text-xs break-all text-fg-secondary">
                docmind.app/<span className="text-accent">{values.slug || 'your-workspace'}</span>
              </p>

              <Button type="submit" size="lg" fullWidth rightIcon={<ArrowRight />}>
                Continue
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              <header className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold text-fg">Does this look right?</h1>
                <p className="text-sm text-fg-muted">
                  The address becomes this workspace's identity in the API and cannot be changed
                  afterwards.
                </p>
              </header>

              <dl className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4 text-sm">
                <div className="flex items-start gap-3">
                  <Building2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  <div className="flex min-w-0 flex-col">
                    <dt className="text-xs text-fg-muted">Name</dt>
                    <dd className="font-medium break-words text-fg">{values.name}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  <div className="flex min-w-0 flex-col">
                    <dt className="text-xs text-fg-muted">Address</dt>
                    <dd className="font-mono break-all text-fg">{values.slug}</dd>
                  </div>
                </div>
              </dl>

              <div className="flex flex-col gap-2 sm:flex-row-reverse">
                <Button
                  size="lg"
                  fullWidth
                  loading={create.isPending}
                  leftIcon={<Check />}
                  onClick={() => void submit()}
                >
                  {create.isPending ? 'Creating…' : 'Create workspace'}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  fullWidth
                  disabled={create.isPending}
                  leftIcon={<ArrowLeft />}
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <p className="text-center text-xs text-fg-muted">
        You can upload your first PDF right after this.
      </p>
    </div>
  )
}

function StepDot({ index, current, label }: { index: 1 | 2; current: 1 | 2; label: string }) {
  const state = current === index ? 'current' : current > index ? 'done' : 'upcoming'

  return (
    <li className="flex items-center gap-2" aria-current={state === 'current' ? 'step' : undefined}>
      <span
        aria-hidden="true"
        className={
          state === 'upcoming'
            ? 'grid size-6 place-items-center rounded-full border border-line text-xs text-fg-muted'
            : 'grid size-6 place-items-center rounded-full bg-accent text-xs font-semibold text-on-accent'
        }
      >
        {state === 'done' ? <Check className="size-3.5" /> : index}
      </span>
      <span className={state === 'upcoming' ? 'text-fg-muted' : 'font-medium text-fg'}>
        {label}
      </span>
      <span className="sr-only">
        {state === 'done' ? '(completed)' : state === 'current' ? '(current step)' : ''}
      </span>
    </li>
  )
}
