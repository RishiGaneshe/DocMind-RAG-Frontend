import { useId } from 'react'
import { cn } from '@/lib/utils'
import { FieldError } from './FieldError'
import { Label } from './Label'

export const FIELD_SHELL =
  'w-full rounded-md border bg-surface-raised px-3 text-base text-fg transition-colors ' +
  'duration-(--dur-fast) ease-(--ease-out) placeholder:text-fg-disabled ' +
  'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--border-focus) ' +
  'disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:text-fg-disabled'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  /** Visually hide the label but keep it for assistive tech. */
  hideLabel?: boolean
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  /** Slot on the trailing edge — the password reveal toggle lives here. */
  trailing?: React.ReactNode
  ref?: React.Ref<HTMLInputElement>
}

/**
 * Owns its own label / hint / error wiring: `aria-describedby` always points at
 * whichever of the two are present, and `aria-invalid` follows `error`. Callers
 * cannot forget it, because they never write it.
 */
export function Input({
  label,
  hideLabel = false,
  hint,
  error,
  leftIcon,
  trailing,
  className,
  id,
  required,
  ...props
}: InputProps) {
  const generated = useId()
  const inputId = id ?? generated
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId} required={required} className={hideLabel ? 'sr-only' : undefined}>
        {label}
      </Label>

      <div className="relative">
        {leftIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-fg-muted [&_svg]:size-4"
          >
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            FIELD_SHELL,
            'h-11',
            leftIcon && 'pl-9',
            trailing && 'pr-11',
            error ? 'border-error' : 'border-line hover:border-line-strong',
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-1 grid place-items-center">{trailing}</span>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
