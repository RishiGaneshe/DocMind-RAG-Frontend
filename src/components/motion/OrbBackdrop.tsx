import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

interface OrbBackdropProps {
  className?: string
  subtle?: boolean
}

export function OrbBackdrop({ className, subtle = false }: OrbBackdropProps) {
  const reduced = useReducedMotion()
  const opacity = subtle ? 0.07 : 0.12

  if (reduced) return null

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none',
        className,
      )}
    >
      <motion.div
        className="absolute -top-32 -left-32 size-[520px] rounded-full bg-accent/30 blur-[120px]"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ opacity }}
      />
      <motion.div
        className="absolute top-1/4 -right-40 size-[620px] rounded-full bg-accent/25 blur-[140px]"
        animate={{
          x: [0, -50, 25, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.94, 1.06, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ opacity }}
      />
    </div>
  )
}
