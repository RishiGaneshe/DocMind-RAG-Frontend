import { motion, useReducedMotion, type Transition } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * The four motion primitives the rest of the app composes.
 *
 * `MotionConfig reducedMotion="user"` at the root already neutralises transform
 * and opacity animations for anyone who asks for less motion; these components
 * additionally *skip* their wrappers in that case so nothing is left behind on
 * the compositor.
 */

/** 200 ms ease-out — the "state change" line of the motion budget (§17.1). */
const ENTER: Transition = { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
/** 480 ms — the scroll-reveal line. Never used for anything interactive. */
const REVEAL: Transition = { duration: 0.48, ease: [0.16, 1, 0.3, 1] }

interface FadeInProps extends React.ComponentProps<typeof motion.div> {
  /** Seconds. Used by Stagger, rarely by hand. */
  delay?: number
  /** Pixels to rise from. 0 for a pure cross-fade. */
  y?: number
}

export function FadeIn({ delay = 0, y = 8, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ENTER, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface RevealProps extends React.ComponentProps<typeof motion.div> {
  delay?: number
  y?: number
  /** How much of the element must be visible. Default 20%. */
  amount?: number
}

/**
 * Reveals once when scrolled into view. `once: true` is not negotiable — a
 * section that re-animates every time it scrolls past is a distraction, and it
 * makes long pages feel unstable.
 */
export function Reveal({ delay = 0, y = 16, amount = 0.2, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ ...REVEAL, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerProps {
  children: React.ReactNode
  /** Seconds between siblings. 60 ms per §17.2. */
  step?: number
  className?: string
  /** Reveal on scroll instead of on mount. */
  onScroll?: boolean
}

/**
 * Applies a delay ramp to its direct children. Implemented by cloning rather
 * than with Motion variants so the children stay plain elements — a `<Card>`
 * does not have to become a `motion.div` to be staggered.
 */
export function Stagger({ children, step = 0.06, className, onScroll = false }: StaggerProps) {
  const reduced = useReducedMotion()
  const items = Array.isArray(children) ? children : [children]

  if (reduced) return <div className={className}>{children}</div>

  const Wrapper = onScroll ? Reveal : FadeIn

  return (
    <div className={className}>
      {items.map((child, index) => (
        <Wrapper key={index} delay={index * step}>
          {child}
        </Wrapper>
      ))}
    </div>
  )
}

/**
 * Route-level transition: an 8 px rise and a fade, 200 ms (§17.2).
 *
 * Keyed by pathname at the call site so React remounts it on navigation. There
 * is no exit animation: waiting for the outgoing page to leave before the
 * incoming one arrives adds latency to every single navigation.
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ENTER}
      className={cn('min-h-full', className)}
    >
      {children}
    </motion.div>
  )
}
