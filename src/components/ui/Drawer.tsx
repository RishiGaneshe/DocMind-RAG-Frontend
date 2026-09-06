import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconButton } from './IconButton'

/** Same primitive as Dialog, presented as an edge-anchored panel. */
export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close

type Side = 'left' | 'right' | 'bottom'

const SIDES: Record<Side, string> = {
  left: 'inset-y-0 left-0 h-dvh w-[min(20rem,85vw)] border-r data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left',
  right:
    'inset-y-0 right-0 h-dvh w-[min(28rem,92vw)] border-l data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right',
  bottom:
    'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t pb-[env(safe-area-inset-bottom)] data-[state=open]:animate-slide-in-bottom data-[state=closed]:animate-slide-out-bottom',
}

interface DrawerContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  side?: Side
  /** Suppress the visible header — the sidebar drawer draws its own. */
  hideHeader?: boolean
  footer?: React.ReactNode
}

export function DrawerContent({
  title,
  description,
  side = 'right',
  hideHeader = false,
  footer,
  className,
  children,
  ...props
}: DrawerContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
          'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden border-line bg-surface shadow-lg',
          SIDES[side],
          className,
        )}
        {...props}
      >
        {hideHeader ? (
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        ) : (
          <div className="flex items-start justify-between gap-4 border-b border-line p-4">
            <div className="flex min-w-0 flex-col gap-1">
              <DialogPrimitive.Title className="text-lg font-semibold text-fg">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-sm text-fg-muted">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <IconButton label="Close" icon={<X />} size="sm" className="-mt-1 -mr-1" />
            </DialogPrimitive.Close>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer && <div className="border-t border-line p-4">{footer}</div>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
