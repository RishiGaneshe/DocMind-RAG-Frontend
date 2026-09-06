import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverClose = PopoverPrimitive.Close
export const PopoverAnchor = PopoverPrimitive.Anchor

interface PopoverContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>, 'title'> {
  /** Rendered as the labelled heading so the popover is announced sensibly. */
  title?: React.ReactNode
}

export function PopoverContent({
  className,
  title,
  sideOffset = 8,
  align = 'end',
  children,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={12}
        className={cn(
          'z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-lg border border-line bg-surface p-4 shadow-lg',
          'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
          className,
        )}
        {...props}
      >
        {title && <p className="mb-3 text-sm font-semibold text-fg">{title}</p>}
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}
