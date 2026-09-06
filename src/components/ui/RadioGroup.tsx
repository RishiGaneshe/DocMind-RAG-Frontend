import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { useId } from 'react'
import { cn } from '@/lib/utils'
import { FieldError } from './FieldError'

export interface RadioOption {
  value: string
  label: React.ReactNode
  hint?: React.ReactNode
  disabled?: boolean
}

interface RadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'children'> {
  /** Group label — rendered as the fieldset legend so it is announced once. */
  label: string
  options: RadioOption[]
  error?: string
  /** Cards give each option a hit area big enough for touch. */
  variant?: 'inline' | 'card'
}

export function RadioGroup({
  label,
  options,
  error,
  variant = 'inline',
  className,
  ...props
}: RadioGroupProps) {
  const groupId = useId()
  const errorId = `${groupId}-error`

  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="mb-1 text-sm font-medium text-fg-secondary">{label}</legend>
      <RadioGroupPrimitive.Root
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(variant === 'card' ? 'grid gap-2 sm:grid-cols-2' : 'flex flex-col gap-1', className)}
        {...props}
      >
        {options.map((option) => {
          const itemId = `${groupId}-${option.value}`
          return (
            <div
              key={option.value}
              className={cn(
                'flex items-start gap-2.5',
                variant === 'card'
                  ? 'rounded-lg border border-line bg-surface p-3 transition-colors has-data-[state=checked]:border-accent has-data-[state=checked]:bg-accent-wash'
                  : 'py-1.5',
              )}
            >
              <RadioGroupPrimitive.Item
                id={itemId}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-(--dur-fast)',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
                  'data-[state=checked]:border-accent disabled:cursor-not-allowed disabled:opacity-50',
                  error ? 'border-error' : 'border-line-strong hover:border-accent',
                )}
              >
                <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-accent" />
              </RadioGroupPrimitive.Item>

              <div className="flex min-w-0 flex-col gap-0.5">
                <label htmlFor={itemId} className="cursor-pointer text-sm text-fg select-none">
                  {option.label}
                </label>
                {option.hint && <p className="text-xs text-fg-muted">{option.hint}</p>}
              </div>
            </div>
          )
        })}
      </RadioGroupPrimitive.Root>
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  )
}
