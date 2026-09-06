import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Collapsible = CollapsiblePrimitive.Root
export const CollapsibleContent = CollapsiblePrimitive.Content

interface TriggerProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> {
  /** Trailing count/summary that stays visible while collapsed. */
  meta?: React.ReactNode
}

export function CollapsibleTrigger({ className, children, meta, ...props }: TriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        'group flex w-full items-center gap-2 rounded-md py-1.5 text-left text-sm font-medium text-fg-secondary',
        'transition-colors duration-(--dur-fast) hover:text-fg',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
        className,
      )}
      {...props}
    >
      <ChevronDown
        aria-hidden="true"
        className="size-4 shrink-0 text-fg-muted transition-transform duration-(--dur-base) ease-(--ease-out) group-data-[state=open]:rotate-180"
      />
      <span className="min-w-0 flex-1">{children}</span>
      {meta}
    </CollapsiblePrimitive.Trigger>
  )
}
