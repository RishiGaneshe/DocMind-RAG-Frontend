import { cn } from '@/lib/utils'

const ELEVATION = {
  0: 'bg-transparent border-line',
  1: 'bg-surface border-line',
  2: 'bg-surface-raised border-line',
  3: 'bg-surface-raised border-line-strong shadow-md',
} as const

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  elevation?: keyof typeof ELEVATION
  interactive?: boolean
  as?: 'div' | 'article' | 'section' | 'li'
  ref?: React.Ref<HTMLDivElement>
}

export function Card({
  elevation = 1,
  interactive = false,
  as = 'div',
  className,
  ...props
}: CardProps) {
  // A union of intrinsic tags gives JSX an *intersected* props signature that no
  // single event-handler type can satisfy, so the tag is narrowed for the type
  // checker only — at runtime it is still whatever the caller asked for.
  const Component = as as 'div'

  return (
    <Component
      className={cn(
        'rounded-lg border',
        ELEVATION[elevation],
        interactive &&
          'transition-[border-color,background-color,transform] duration-(--dur-base) ease-(--ease-out) hover:border-line-strong hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-4 sm:p-5', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  // Content arrives through `children`, which the rule cannot follow across a
  // component boundary; every call site passes text.
  // eslint-disable-next-line jsx-a11y/heading-has-content
  return <h3 className={cn('text-xl font-semibold text-fg', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-fg-muted', className)} {...props} />
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pb-4 sm:px-5 sm:pb-5', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-3 border-t border-line px-4 py-3 sm:px-5', className)}
      {...props}
    />
  )
}
