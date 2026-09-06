import { Toaster as Sonner } from 'sonner'
import { useUiStore } from '@/stores/uiStore'

/**
 * Toasts are for confirmations and background failures — never for anything the
 * user must act on, which belongs in the page where they can see it.
 *
 * Sonner is configured to inherit our tokens rather than its own palette, and
 * `closeButton` is on because a toast that can only be waited out is an
 * accessibility problem for anyone who reads slowly.
 */
export function Toaster() {
  const resolvedTheme = useUiStore((s) => s.resolvedTheme)

  return (
    <Sonner
      theme={resolvedTheme}
      position="bottom-right"
      closeButton
      // Sonner's own offsets do not know about the safe area on iOS.
      offset="16px"
      mobileOffset={{ bottom: 'calc(16px + env(safe-area-inset-bottom))', left: '16px', right: '16px' }}
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            'group !bg-surface-raised !border-line !text-fg !rounded-lg !shadow-lg !font-sans !text-sm',
          title: '!text-fg !font-medium',
          description: '!text-fg-muted',
          actionButton: '!bg-accent !text-on-accent !rounded-md',
          cancelButton: '!bg-surface !text-fg-secondary !rounded-md',
          closeButton: '!bg-surface-raised !border-line !text-fg-muted hover:!text-fg',
          error: '!border-error/40',
          success: '!border-success/40',
          warning: '!border-warning/40',
          info: '!border-accent/40',
        },
      }}
    />
  )
}
