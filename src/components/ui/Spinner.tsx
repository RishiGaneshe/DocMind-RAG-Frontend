import { cn } from '@/lib/utils'

const SIZES = {
  xs: 'size-3 border',
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
  lg: 'size-6 border-2',
} as const

interface SpinnerProps {
  size?: keyof typeof SIZES
  className?: string
  /** Announce progress to assistive tech. Omit inside an already-labelled control. */
  label?: string
}

/**
 * A rotating ring. `animate-spin` is reduced to a near-zero duration under
 * `prefers-reduced-motion` by base.css, which leaves a static ring — still a
 * recognisable "busy" affordance without the movement.
 */
export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'inline-block animate-spin rounded-full border-current border-r-transparent align-[-0.125em] motion-reduce:border-r-current motion-reduce:opacity-60',
          SIZES[size],
          className,
        )}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  )
}
