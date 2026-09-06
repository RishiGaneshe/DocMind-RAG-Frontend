import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

export const TooltipProvider = TooltipPrimitive.Provider

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  /** Keyboard shortcut rendered on the trailing edge. */
  shortcut?: string
  delayDuration?: number
}

/**
 * Tooltips are decoration, never the only source of a control's name — every
 * icon-only control already has an `aria-label` (see IconButton), so a tooltip
 * that never opens on touch costs nothing.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  shortcut,
  delayDuration = 250,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          className={cn(
            'z-50 flex items-center gap-2 rounded-md border border-line bg-surface-raised px-2.5 py-1.5 text-xs text-fg shadow-md',
            'data-[state=delayed-open]:animate-pop-in data-[state=closed]:animate-fade-out',
          )}
        >
          {content}
          {shortcut && (
            <kbd className="rounded-sm border border-line bg-bg-subtle px-1.5 font-mono text-[0.6875rem] text-fg-muted">
              {shortcut}
            </kbd>
          )}
          <TooltipPrimitive.Arrow className="fill-(--surface-raised)" width={10} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
