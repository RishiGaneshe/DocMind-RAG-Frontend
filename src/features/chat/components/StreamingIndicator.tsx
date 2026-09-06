import { cn } from '@/lib/utils'

/**
 * The two "it is working" affordances for a streaming answer.
 *
 * Both are `aria-hidden`: the thread announces its state once through a
 * `role="status"` line in the panel, and a blinking caret read aloud on a loop
 * is noise. `animate-caret` is a stepped keyframe, so it blinks rather than
 * fading — and base.css neutralises it under `prefers-reduced-motion`.
 */

/** Shown before the first token, when there is nothing to render yet. */
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('inline-flex items-center gap-1 py-1', className)}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 rounded-full bg-accent/70 animate-caret"
          style={{ animationDelay: `${index * 160}ms`, animationDuration: '1.2s' }}
        />
      ))}
    </span>
  )
}

/** Trails the last character while tokens are still arriving. */
export function StreamingCursor({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] rounded-[1px] bg-accent align-baseline animate-caret',
        className,
      )}
    />
  )
}
