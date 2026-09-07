import { motion, useReducedMotion, type Transition } from 'motion/react'
import { cn } from '@/lib/utils'

const ENTER: Transition = { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
const REVEAL: Transition = { duration: 0.48, ease: [0.16, 1, 0.3, 1] }

interface FadeInProps extends React.ComponentProps<typeof motion.div> {
  delay?: number
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
  amount?: number
}

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
  step?: number
  className?: string
  onScroll?: boolean
}

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
      className={cn('flex-1', className)}
    >
      {children}
    </motion.div>
  )
}
