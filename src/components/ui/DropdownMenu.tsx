import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuGroup = DropdownMenuPrimitive.Group
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = 'end',
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 min-w-52 overflow-hidden rounded-md border border-line bg-surface p-1 shadow-lg',
          'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

const ITEM =
  'relative flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-sm text-fg-secondary outline-hidden select-none ' +
  'data-highlighted:bg-accent-wash data-highlighted:text-fg data-disabled:pointer-events-none data-disabled:opacity-50 ' +
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-muted data-highlighted:[&_svg]:text-accent'

interface ItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  /** Right-aligned hint — a keyboard shortcut or a count. */
  shortcut?: string
  tone?: 'default' | 'danger'
}

export function DropdownMenuItem({ className, shortcut, tone = 'default', children, ...props }: ItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        ITEM,
        tone === 'danger' && 'text-error data-highlighted:bg-wash-error data-highlighted:text-error [&_svg]:text-error data-highlighted:[&_svg]:text-error',
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2.5">{children}</span>
      {shortcut && <span className="font-mono text-xs text-fg-muted">{shortcut}</span>}
    </DropdownMenuPrimitive.Item>
  )
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem className={cn(ITEM, 'pl-8', className)} {...props}>
      <DropdownMenuPrimitive.ItemIndicator className="absolute left-2">
        <Check aria-hidden="true" className="size-4 text-accent!" />
      </DropdownMenuPrimitive.ItemIndicator>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn('px-2 py-1.5 text-xs font-semibold tracking-wide text-fg-muted uppercase', className)}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-line', className)} {...props} />
  )
}
