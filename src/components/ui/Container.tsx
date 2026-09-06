import { cn } from '@/lib/utils'

const WIDTHS = {
  prose: 'max-w-(--prose-max)',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
} as const

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: keyof typeof WIDTHS
  as?: 'div' | 'section' | 'main' | 'header' | 'footer' | 'nav'
}

/** Centres content and owns the horizontal gutter — 16px on phones, 24px up. */
export function Container({ width = 'xl', as: Component = 'div', className, ...props }: ContainerProps) {
  return (
    <Component
      className={cn('mx-auto w-full px-4 sm:px-6', WIDTHS[width], className)}
      {...props}
    />
  )
}
