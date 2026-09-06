import { cn } from '@/lib/utils'
import type { Tone } from './Badge'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-raised text-fg-secondary border-line',
  accent: 'bg-accent-wash text-accent border-accent/30',
  success: 'bg-wash-success text-success border-success/30',
  warning: 'bg-wash-warning text-warning border-warning/30',
  error: 'bg-wash-error text-error border-error/30',
}

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  size?: 'sm' | 'md'
  icon?: React.ReactNode
}

/** Fully rounded label — used for chips, counts and status. */
export function Pill({ tone = 'neutral', size = 'md', icon, className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        '[&_svg]:size-3.5 [&_svg]:shrink-0',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
