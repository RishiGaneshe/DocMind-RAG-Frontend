import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders a short stack of lines with a ragged last line. */
  lines?: number
  circle?: boolean
}

/**
 * The shimmer is `motion-safe:` only — under `prefers-reduced-motion` the
 * placeholder is a flat block, which is exactly what that preference asks for.
 */
export function Skeleton({ lines, circle = false, className, ...props }: SkeletonProps) {
  const base = cn(
    'bg-surface-raised motion-safe:animate-shimmer',
    circle ? 'rounded-full' : 'rounded-md',
    className,
  )

  if (!lines) return <div aria-hidden="true" className={base} {...props} />

  return (
    <div aria-hidden="true" className="flex flex-col gap-2" {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(base, 'h-4', i === lines - 1 && lines > 1 && 'w-3/5')}
        />
      ))}
    </div>
  )
}
