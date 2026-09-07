import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'relative inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none ' +
  'transition-[background-color,border-color,color,box-shadow,opacity] duration-(--dur-fast) ease-(--ease-out) ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus) ' +
  'disabled:pointer-events-none disabled:opacity-50 active:translate-y-px motion-reduce:active:translate-y-0'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active shadow-sm',
  secondary:
    'bg-surface-raised text-fg border border-line hover:border-line-strong hover:bg-surface-raised/80',
  ghost: 'text-fg-secondary hover:bg-accent-wash hover:text-fg',
  danger: 'bg-error text-white hover:bg-error/90 active:bg-error/80 shadow-sm',
  link: 'text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent px-0! h-auto!',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  asChild = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)

  if (asChild) {
    // Slot merges props onto the child, so an icon has to live inside that child
    // (`<Link><Upload />Upload</Link>`) rather than arriving as `leftIcon` — the
    // sizing rule below is applied here so it looks identical either way.
    // `disabled` is advisory on a link: an anchor cannot be disabled, so it is
    // styled and announced, and anything that must be truly blocked renders a
    // real <button>.
    return (
      <Component
        className={cn(
          classes,
          '[&_svg]:size-4 [&_svg]:shrink-0',
          disabled && 'pointer-events-none opacity-50',
        )}
        aria-disabled={disabled || undefined}
        {...props}
      >
        {children}
      </Component>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        </span>
      )}
      <span
        className={cn(
          'inline-flex items-center gap-2',
          loading && 'opacity-0',
          '[&_svg]:size-4 [&_svg]:shrink-0',
        )}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </button>
  )
}
