import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressProps {
  /** Omit for the indeterminate presentation (server-side processing). */
  value?: number
  max?: number
  label: string
  /** Show the numeric percentage beside the label. */
  showValue?: boolean
  tone?: 'accent' | 'success' | 'error'
  className?: string
}

const TONES = {
  accent: 'bg-accent',
  success: 'bg-success',
  error: 'bg-error',
} as const

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  tone = 'accent',
  className,
}: ProgressProps) {
  const indeterminate = value === undefined
  const pct = indeterminate ? 0 : Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(showValue || label) && (
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="truncate text-fg-secondary">{label}</span>
          {showValue && !indeterminate && (
            <span className="shrink-0 font-mono tabular-nums text-fg-muted">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      <ProgressPrimitive.Root
        value={indeterminate ? null : value}
        max={max}
        aria-label={label}
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-raised"
      >
        {indeterminate ? (
          // A travelling band; reduced-motion users see a static 30% bar, which
          // still reads as "something is happening".
          <div
            aria-hidden="true"
            className={cn(
              'h-full w-2/5 rounded-full motion-safe:animate-indeterminate',
              TONES[tone],
            )}
          />
        ) : (
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full rounded-full transition-transform duration-(--dur-base) ease-(--ease-out)',
              TONES[tone],
            )}
            style={{ width: `${pct}%` }}
          />
        )}
      </ProgressPrimitive.Root>
    </div>
  )
}
