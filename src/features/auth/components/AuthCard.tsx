import { Link } from 'react-router'
import { cn } from '@/lib/utils'

/**
 * The heading block every auth screen shares, so the type scale and spacing
 * cannot drift between /login and /signup.
 */

interface AuthCardProps {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <header className="flex flex-col gap-1.5">
        {/* One h1 per page, and it is the thing the user came to do. */}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        {description && <p className="text-sm text-fg-muted text-pretty">{description}</p>}
      </header>

      {children}

      {footer && <div className="text-center text-sm text-fg-muted">{footer}</div>}
    </div>
  )
}

interface AuthFooterLinkProps {
  prompt: string
  to: string
  label: string
}

export function AuthFooterLink({ prompt, to, label }: AuthFooterLinkProps) {
  return (
    <span>
      {prompt}{' '}
      <Link
        to={to}
        className="rounded font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
      >
        {label}
      </Link>
    </span>
  )
}
