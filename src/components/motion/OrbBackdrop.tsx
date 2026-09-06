import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Two blurred Icy Blue orbs drifting behind the auth and hero panels.
 *
 * This is the only ambient animation in the product (§17.2). It survived the
 * redesign because it gives the dark surfaces depth that a flat fill cannot,
 * but it is reduced from the current three orbs to two and from ~20% to 12%
 * opacity, and it does not render at all under `prefers-reduced-motion` — a
 * 20-second infinite loop is exactly what that preference is about.
 *
 * Only `transform` and `opacity` animate, and the blur is baked into a static
 * `filter` so the compositor never re-rasterises it.
 */

interface OrbBackdropProps {
  className?: string
  /** Dimmer variant for content-heavy pages. */
  subtle?: boolean
}

export function OrbBackdrop({ className, subtle = false }: OrbBackdropProps) {
  const reduced = useReducedMotion()
  const opacity = subtle ? 0.07 : 0.12

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        // A faint radial grid under the orbs; pure CSS, no animation.
        'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,var(--accent-wash),transparent_60%)]',
        className,
      )}
    >
      <motion.span
        className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-sky-200 blur-[120px]"
        style={{ opacity }}
        initial={false}
        animate={reduced ? undefined : { x: [0, 60, -20, 0], y: [0, 40, 80, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.span
        className="absolute -right-32 -bottom-40 size-[32rem] rounded-full bg-sky-400 blur-[140px]"
        style={{ opacity: opacity * 0.8 }}
        initial={false}
        animate={reduced ? undefined : { x: [0, -50, 30, 0], y: [0, -30, -70, 0], scale: [1, 0.94, 1.06, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: 2 }}
      />
    </div>
  )
}
