import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FieldErrorProps {
  /** Rendered only when present; the element itself stays mounted so the
   *  `aria-describedby` target never disappears mid-interaction. */
  children?: React.ReactNode
  id?: string
  className?: string
}

export function FieldError({ children, id, className }: FieldErrorProps) {
  return (
    <p
      id={id}
      className={cn(
        'flex items-start gap-1.5 text-sm text-error',
        !children && 'hidden',
        className,
      )}
    >
      {children ? (
        <>
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{children}</span>
        </>
      ) : null}
    </p>
  )
}
