import { cn } from '@/lib/utils'

interface LogoMarkProps extends React.SVGProps<SVGSVGElement> {
  /** Fill for the plate behind the bars. `none` gives a bare mark. */
  plate?: boolean
}

/**
 * The DocMind mark: three distilled lines. Geometry is identical to
 * public/favicon.svg and scripts/generate-icons.mjs so every surface agrees.
 */
export function LogoMark({ className, plate = true, ...props }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn('size-8 shrink-0', className)}
      {...props}
    >
      {plate && <rect width="32" height="32" rx="8" className="fill-bg-base" />}
      <rect x="7" y="8" width="18" height="3.5" rx="1.75" className="fill-accent" />
      <rect
        x="7"
        y="14.25"
        width="13"
        height="3.5"
        rx="1.75"
        className="fill-accent"
        opacity="0.72"
      />
      <rect
        x="7"
        y="20.5"
        width="8"
        height="3.5"
        rx="1.75"
        className="fill-accent"
        opacity="0.42"
      />
    </svg>
  )
}
