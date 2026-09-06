import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  /** An icon or small illustration. Always decorative. */
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: { label: string; onClick?: () => void; href?: string }
  secondaryAction?: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line px-6 text-center',
        size === 'md' ? 'py-12 sm:py-16' : 'py-8',
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-accent-wash text-accent [&_svg]:size-6"
        >
          {icon}
        </span>
      )}
      <h3 className={cn('font-semibold text-fg', size === 'md' ? 'text-xl' : 'text-base')}>
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm text-fg-muted text-pretty">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {action &&
            (action.href ? (
              <Button asChild>
                <a href={action.href}>{action.label}</a>
              </Button>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            ))}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
