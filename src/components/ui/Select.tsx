import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/lib/utils'
import { FieldError } from './FieldError'
import { Label } from './Label'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  label: string
  hideLabel?: boolean
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  name?: string
  id?: string
  className?: string
  /** Match the trigger to a dense toolbar rather than a form row. */
  size?: 'sm' | 'md'
}

export function Select({
  label,
  hideLabel = false,
  options,
  hint,
  error,
  className,
  id,
  placeholder = 'Select…',
  size = 'md',
  ...props
}: SelectProps) {
  const generated = useId()
  const selectId = id ?? generated
  const hintId = `${selectId}-hint`
  const errorId = `${selectId}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={selectId} className={hideLabel ? 'sr-only' : undefined}>
        {label}
      </Label>

      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'inline-flex w-full items-center justify-between gap-2 rounded-md border bg-surface-raised px-3 text-left text-fg',
            'transition-colors duration-(--dur-fast) data-placeholder:text-fg-disabled',
            'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--border-focus)',
            'disabled:cursor-not-allowed disabled:opacity-50',
            size === 'sm' ? 'h-9 text-sm' : 'h-11 text-base',
            error ? 'border-error' : 'border-line hover:border-line-strong',
            className,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown aria-hidden="true" className="size-4 text-fg-muted" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            className={cn(
              'z-50 max-h-64 min-w-(--radix-select-trigger-width) overflow-hidden rounded-md border border-line bg-surface shadow-lg',
              'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
            )}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-2 rounded-sm py-2 pr-2 pl-8 text-sm text-fg-secondary outline-hidden select-none',
                    'data-highlighted:bg-accent-wash data-highlighted:text-fg',
                    'data-[state=checked]:text-fg data-disabled:pointer-events-none data-disabled:opacity-50',
                  )}
                >
                  <SelectPrimitive.ItemIndicator className="absolute left-2">
                    <Check aria-hidden="true" className="size-4 text-accent" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {hint && !error && (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
