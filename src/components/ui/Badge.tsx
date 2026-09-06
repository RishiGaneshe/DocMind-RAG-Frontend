import { cn } from '@/lib/utils'

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'error'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-raised text-fg-secondary border-line',
  accent: 'bg-accent-wash text-accent border-accent/30',
  success: 'bg-wash-success text-success border-success/30',
  warning: 'bg-wash-warning text-warning border-warning/30',
  error: 'bg-wash-error text-error border-error/30',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  /** A leading dot instead of an icon — used by StatusPill. */
  dot?: boolean
}

/** Compact, rectangular-ish label for metadata. */
export function Badge({ tone = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
