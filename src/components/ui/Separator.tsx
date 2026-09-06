import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as VisuallyHiddenPrimitive from '@radix-ui/react-visually-hidden'
import { cn } from '@/lib/utils'

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        'shrink-0 bg-line',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}

/** Available to assistive tech, invisible on screen. */
export const VisuallyHidden = VisuallyHiddenPrimitive.Root

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

/** A key cap. Callers pass display glyphs ("⌘", "K") — no key translation here. */
export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-sm border border-line bg-surface-raised px-1.5 py-0.5',
        'font-mono text-[0.6875rem] leading-none text-fg-muted',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}
