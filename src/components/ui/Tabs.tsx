import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        // Horizontal scroll rather than wrapping: settings tabs must stay on
        // one line at 320px (§16).
        'flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'relative -mb-px shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap text-fg-muted',
        'transition-colors duration-(--dur-fast) hover:text-fg',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
        'data-[state=active]:border-accent data-[state=active]:text-fg',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('pt-4 focus-visible:outline-none', className)}
      {...props}
    />
  )
}
