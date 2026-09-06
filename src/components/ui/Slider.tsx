import * as SliderPrimitive from '@radix-ui/react-slider'
import { useId } from 'react'
import { cn } from '@/lib/utils'

interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'children'> {
  label: string
  /** Rendered beside the label — the live value, formatted by the caller. */
  valueLabel?: React.ReactNode
  hint?: React.ReactNode
}

export function Slider({ label, valueLabel, hint, className, id, ...props }: SliderProps) {
  const generated = useId()
  const sliderId = id ?? generated
  const hintId = `${sliderId}-hint`

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={sliderId} className="text-sm font-medium text-fg-secondary">
          {label}
        </label>
        {valueLabel && (
          <span className="font-mono text-sm tabular-nums text-fg">{valueLabel}</span>
        )}
      </div>

      <SliderPrimitive.Root
        id={sliderId}
        aria-describedby={hint ? hintId : undefined}
        className={cn('relative flex h-5 w-full touch-none items-center select-none', className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-raised">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={label}
          className={cn(
            'block size-5 rounded-full border-2 border-(--bg-base) bg-accent shadow-sm transition-transform',
            'hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
            'motion-reduce:hover:scale-100',
          )}
        />
      </SliderPrimitive.Root>

      {hint && (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
