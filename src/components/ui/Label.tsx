import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean
  optional?: boolean
}

export function Label({ className, children, required, optional, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'flex items-center gap-1.5 text-sm font-medium text-fg-secondary select-none',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-error" aria-hidden="true">
          *
        </span>
      )}
      {required && <span className="sr-only">(required)</span>}
      {optional && <span className="text-xs font-normal text-fg-muted">(optional)</span>}
    </LabelPrimitive.Root>
  )
}
