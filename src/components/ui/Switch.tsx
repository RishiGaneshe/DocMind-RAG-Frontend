import * as SwitchPrimitive from '@radix-ui/react-switch'
import { useId } from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'children'> {
  label: React.ReactNode
  hint?: React.ReactNode
  /** Put the label before the control — used in settings rows. */
  labelPosition?: 'left' | 'right'
}

export function Switch({
  label,
  hint,
  labelPosition = 'right',
  className,
  id,
  ...props
}: SwitchProps) {
  const generated = useId()
  const switchId = id ?? generated
  const hintId = `${switchId}-hint`

  const control = (
    <SwitchPrimitive.Root
      id={switchId}
      aria-describedby={hint ? hintId : undefined}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-(--dur-base) ease-(--ease-out)',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
        'data-[state=checked]:border-accent data-[state=checked]:bg-accent',
        'data-[state=unchecked]:border-line-strong data-[state=unchecked]:bg-surface-raised',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block size-4.5 rounded-full shadow-sm transition-transform duration-(--dur-base) ease-(--ease-out)',
          'translate-x-0.75 data-[state=checked]:translate-x-6',
          'data-[state=checked]:bg-(--text-on-accent) data-[state=unchecked]:bg-(--color-ink-500)',
        )}
      />
    </SwitchPrimitive.Root>
  )

  const text = (
    <span className="flex min-w-0 flex-col gap-0.5">
      <label htmlFor={switchId} className="cursor-pointer text-sm text-fg select-none">
        {label}
      </label>
      {hint && (
        <span id={hintId} className="text-xs text-fg-muted">
          {hint}
        </span>
      )}
    </span>
  )

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-1',
        labelPosition === 'left' && 'justify-between',
      )}
    >
      {labelPosition === 'left' ? (
        <>
          {text}
          {control}
        </>
      ) : (
        <>
          {control}
          {text}
        </>
      )}
    </div>
  )
}
