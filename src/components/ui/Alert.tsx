import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AlertTone = 'info' | 'success' | 'warning' | 'error'

const TONES: Record<AlertTone, { wrap: string; icon: React.ReactNode }> = {
  info: {
    wrap: 'bg-wash-info border-accent/30 text-fg',
    icon: <Info aria-hidden="true" className="size-5 text-accent" />,
  },
  success: {
    wrap: 'bg-wash-success border-success/30 text-fg',
    icon: <CheckCircle2 aria-hidden="true" className="size-5 text-success" />,
  },
  warning: {
    wrap: 'bg-wash-warning border-warning/30 text-fg',
    icon: <AlertTriangle aria-hidden="true" className="size-5 text-warning" />,
  },
  error: {
    wrap: 'bg-wash-error border-error/30 text-fg',
    icon: <XCircle aria-hidden="true" className="size-5 text-error" />,
  },
}

interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone
  title?: React.ReactNode
  /** Buttons or links; kept out of the announced text flow deliberately. */
  action?: React.ReactNode
  icon?: React.ReactNode
}

/**
 * Errors get `role="alert"` (interrupts); everything else gets `role="status"`
 * (polite). That distinction is the whole point of the component — an error the
 * user cannot hear is an error they will hit twice.
 */
export function Alert({
  tone = 'info',
  title,
  action,
  icon,
  className,
  children,
  ...props
}: AlertProps) {
  const { wrap, icon: defaultIcon } = TONES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-md border p-3 sm:p-4', wrap, className)}
      {...props}
    >
      <span className="mt-0.5 shrink-0">{icon ?? defaultIcon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className="text-sm font-semibold text-fg">{title}</p>}
        {children && <div className="text-sm text-fg-secondary">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
