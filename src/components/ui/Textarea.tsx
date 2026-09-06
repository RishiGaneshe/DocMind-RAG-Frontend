import { useId } from 'react'
import { cn } from '@/lib/utils'
import { FieldError } from './FieldError'
import { FIELD_SHELL } from './Input'
import { Label } from './Label'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hideLabel?: boolean
  hint?: string
  error?: string
  /** Renders "1,847 / 2,000" under the field and warns as it fills up. */
  counter?: { value: number; max: number; warnRatio?: number }
  ref?: React.Ref<HTMLTextAreaElement>
}

export function Textarea({
  label,
  hideLabel = false,
  hint,
  error,
  counter,
  className,
  id,
  required,
  ...props
}: TextareaProps) {
  const generated = useId()
  const fieldId = id ?? generated
  const hintId = `${fieldId}-hint`
  const errorId = `${fieldId}-error`
  const counterId = `${fieldId}-counter`
  const describedBy =
    [hint && hintId, counter && counterId, error && errorId].filter(Boolean).join(' ') || undefined

  const ratio = counter ? counter.value / counter.max : 0
  const warn = counter ? ratio >= (counter.warnRatio ?? 0.9) : false
  const over = counter ? counter.value >= counter.max : false

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId} required={required} className={hideLabel ? 'sr-only' : undefined}>
        {label}
      </Label>

      <textarea
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          FIELD_SHELL,
          'min-h-24 resize-y py-2.5 leading-relaxed',
          error ? 'border-error' : 'border-line hover:border-line-strong',
          className,
        )}
        {...props}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {hint && !error && (
            <p id={hintId} className="text-xs text-fg-muted">
              {hint}
            </p>
          )}
          <FieldError id={errorId}>{error}</FieldError>
        </div>

        {counter && (
          <p
            id={counterId}
            // Only announce once it matters; a live counter on every keystroke
            // is unusable with a screen reader.
            aria-live={warn ? 'polite' : 'off'}
            className={cn(
              'shrink-0 font-mono text-xs tabular-nums',
              over ? 'text-error' : warn ? 'text-warning' : 'text-fg-muted',
            )}
          >
            {counter.value.toLocaleString()} / {counter.max.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
