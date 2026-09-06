import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'
import type { ButtonVariant } from './Button'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active',
  secondary: 'bg-surface-raised text-fg border border-line hover:border-line-strong',
  ghost: 'text-fg-secondary hover:bg-accent-wash hover:text-fg',
  danger: 'text-error hover:bg-wash-error',
  link: 'text-accent hover:text-accent-hover',
}

const SIZES = {
  sm: 'size-9 [&_svg]:size-4',
  md: 'size-11 [&_svg]:size-5',
  lg: 'size-12 [&_svg]:size-5',
} as const

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  /**
   * Required, not optional: an icon-only control without an accessible name is
   * invisible to screen readers, so the type system refuses to let one exist.
   */
  label: string
  icon: React.ReactNode
  variant?: ButtonVariant
  size?: keyof typeof SIZES
  loading?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

export function IconButton({
  label,
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  className,
  disabled,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        'inline-grid place-items-center rounded-md transition-colors duration-(--dur-fast) ease-(--ease-out)',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
    </button>
  )
}
