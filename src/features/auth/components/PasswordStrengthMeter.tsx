import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { PASSWORD_MIN } from '@/lib/constants'

const LEVELS = [
  { label: 'Too short', bar: 'bg-error', text: 'text-error' },
  { label: 'Weak', bar: 'bg-error', text: 'text-error' },
  { label: 'Fair', bar: 'bg-warning', text: 'text-warning' },
  { label: 'Good', bar: 'bg-accent', text: 'text-accent' },
  { label: 'Strong', bar: 'bg-success', text: 'text-success' },
] as const

export function scorePassword(value: string): number {
  if (!value) return 0
  if (value.length < PASSWORD_MIN) return 0
  let score = 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  if (value.length >= 16) score = Math.min(4, score + 1)
  return score
}

interface PasswordStrengthMeterProps {
  value: string
  className?: string
}

export function PasswordStrengthMeter({ value, className }: PasswordStrengthMeterProps) {
  const score = useMemo(() => scorePassword(value), [value])
  const level = LEVELS[score]

  if (!value) return null

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-(--dur-fast)',
              step <= Math.max(score, 1) && value ? level.bar : 'bg-line',
            )}
          />
        ))}
      </div>
      {/*
        polite, not assertive: strength changes on every keystroke, and an
        assertive region would interrupt the screen reader constantly.
      */}
      <p className="text-xs text-fg-muted" aria-live="polite">
        Password strength: <span className={cn('font-medium', level.text)}>{level.label}</span>
        {score < 3 && (
          <span className="text-fg-muted">
            {' '}
            — mix upper and lower case, a number and a symbol.
          </span>
        )}
      </p>
    </div>
  )
}
