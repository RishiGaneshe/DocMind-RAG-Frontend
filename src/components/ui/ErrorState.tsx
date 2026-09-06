import { AlertTriangle, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  description?: React.ReactNode
  /** Wired to whatever retry the caller has — a refetch, a reload, a resend. */
  onRetry?: () => void
  retryLabel?: string
  secondaryAction?: React.ReactNode
  /** Technical detail, collapsed by default. Never the primary message. */
  detail?: string
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'The request did not complete. This is usually temporary.',
  onRetry,
  retryLabel = 'Try again',
  secondaryAction,
  detail,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-error/30 bg-wash-error px-6 py-10 text-center',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-full bg-error/15 text-error"
      >
        <AlertTriangle className="size-6" />
      </span>
      <h3 className="text-xl font-semibold text-fg">{title}</h3>
      <p className="max-w-md text-sm text-fg-secondary text-pretty">{description}</p>

      {detail && (
        <details className="max-w-full">
          <summary className="cursor-pointer text-xs text-fg-muted hover:text-fg-secondary">
            Technical details
          </summary>
          <pre className="mt-2 max-w-full overflow-x-auto rounded-md bg-bg-base p-3 text-left font-mono text-xs text-fg-muted">
            {detail}
          </pre>
        </details>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  )
}
