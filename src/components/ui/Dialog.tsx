import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconButton } from './IconButton'

/**
 * Radix Dialog gives us the focus trap, Escape handling, scroll lock and
 * focus restoration for free — none of which the current static pages do.
 */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

const SIZES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
} as const

interface DialogContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  size?: keyof typeof SIZES
  /** Hide the default close button when the flow must be completed. */
  hideClose?: boolean
  footer?: React.ReactNode
}

export function DialogContent({
  title,
  description,
  size = 'md',
  hideClose = false,
  footer,
  className,
  children,
  ...props
}: DialogContentProps) {
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
          // Full-width sheet on phones, centred card from sm up (§16).
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-xl border border-line bg-surface shadow-lg',
          'pb-[env(safe-area-inset-bottom)]',
          'sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:pb-0',
          'data-[state=open]:animate-slide-in-bottom data-[state=closed]:animate-slide-out-bottom',
          'sm:data-[state=open]:animate-pop-in sm:data-[state=closed]:animate-pop-out',
          SIZES[size],
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-1">
            <DialogPrimitive.Title className="text-xl font-semibold text-fg">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-sm text-fg-muted">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          {!hideClose && (
            <DialogPrimitive.Close asChild>
              <IconButton label="Close" icon={<X />} size="sm" className="-mt-1 -mr-1" />
            </DialogPrimitive.Close>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-line p-4 sm:flex-row sm:justify-end sm:p-5">
            {footer}
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
