import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { LogoMark } from './LogoMark'
import { Wordmark } from './Wordmark'

interface LogoProps {
  /** Hide the wordmark — used by the collapsed sidebar rail. */
  markOnly?: boolean
  /** Render as a link to `to`; omit for a plain, non-interactive lockup. */
  to?: string
  className?: string
}

export function Logo({ markOnly = false, to, className }: LogoProps) {
  const content = (
    <>
      <LogoMark className="size-8" />
      {markOnly ? <span className="sr-only">DocMind</span> : <Wordmark />}
    </>
  )

  const classes = cn(
    'inline-flex items-center gap-2 rounded-md',
    to && 'transition-opacity duration-(--dur-fast) hover:opacity-80',
    className,
  )

  if (!to) return <span className={classes}>{content}</span>

  return (
    <Link to={to} className={classes} aria-label="DocMind home">
      {content}
    </Link>
  )
}
