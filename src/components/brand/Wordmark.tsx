import { cn } from '@/lib/utils'

/** The wordmark as text — one font, one weight, tightened tracking. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-display text-[1.0625rem] font-semibold tracking-[-0.02em] text-fg',
        className,
      )}
    >
      Doc<span className="text-accent">Mind</span>
    </span>
  )
}
