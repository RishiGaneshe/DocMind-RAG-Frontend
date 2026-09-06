import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/lib/utils'
import { FieldError } from './FieldError'

interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'children'> {
  label: React.ReactNode
  hint?: React.ReactNode
  error?: string
}

export function Checkbox({ label, hint, error, className, id, ...props }: CheckboxProps) {
  const generated = useId()
  const boxId = id ?? generated
  const hintId = `${boxId}-hint`
  const errorId = `${boxId}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      {/* 44px row height on touch: the padding is part of the target. */}
      <div className="flex items-start gap-2.5 py-1.5">
        <CheckboxPrimitive.Root
          id={boxId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm border transition-colors duration-(--dur-fast)',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
            'data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-on-accent',
            'data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent data-[state=indeterminate]:text-on-accent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-error' : 'border-line-strong hover:border-accent',
            className,
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator>
            {props.checked === 'indeterminate' ? (
              <Minus className="size-3.5" strokeWidth={3} />
            ) : (
              <Check className="size-3.5" strokeWidth={3} />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        <div className="flex flex-col gap-0.5">
          <label htmlFor={boxId} className="cursor-pointer text-sm text-fg-secondary select-none">
            {label}
          </label>
          {hint && (
            <p id={hintId} className="text-xs text-fg-muted">
              {hint}
            </p>
          )}
        </div>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
