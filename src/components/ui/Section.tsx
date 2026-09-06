import { cn } from '@/lib/utils'
import { Container } from './Container'

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Vertical rhythm for marketing sections. */
  spacing?: 'sm' | 'md' | 'lg'
  tone?: 'base' | 'subtle'
  containerWidth?: React.ComponentProps<typeof Container>['width']
  /** Eyebrow / heading / lead, rendered above the children when provided. */
  eyebrow?: string
  title?: React.ReactNode
  /**
   * The heading level for `title`. Sections are body content, so `h2` is right
   * almost everywhere — but on a page whose opening section *is* the page
   * heading, that would leave the document with no `h1` to start from.
   */
  titleAs?: 'h1' | 'h2' | 'h3'
  lead?: React.ReactNode
  align?: 'left' | 'center'
}

const SPACING = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-20 lg:py-24',
  lg: 'py-20 sm:py-24 lg:py-32',
} as const

const TITLE_SIZE = {
  h1: 'text-4xl sm:text-5xl',
  h2: 'text-3xl',
  h3: 'text-2xl',
} as const

export function Section({
  spacing = 'md',
  tone = 'base',
  containerWidth = 'xl',
  eyebrow,
  title,
  titleAs: Title = 'h2',
  lead,
  align = 'left',
  className,
  children,
  ...props
}: SectionProps) {
  const hasHeader = Boolean(eyebrow || title || lead)

  return (
    <section
      className={cn(SPACING[spacing], tone === 'subtle' && 'bg-bg-subtle', className)}
      {...props}
    >
      <Container width={containerWidth}>
        {hasHeader && (
          <div
            className={cn(
              'flex flex-col gap-3',
              align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl',
              'mb-10 sm:mb-12',
            )}
          >
            {eyebrow && (
              <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
                {eyebrow}
              </p>
            )}
            {title && (
              <Title
                className={cn(
                  'font-semibold tracking-tight text-fg text-balance',
                  TITLE_SIZE[Title],
                )}
              >
                {title}
              </Title>
            )}
            {lead && <p className="text-lg text-fg-secondary text-pretty">{lead}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
