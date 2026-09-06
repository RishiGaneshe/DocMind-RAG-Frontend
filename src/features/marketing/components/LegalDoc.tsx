import { Link } from 'react-router'
import { FadeIn } from '@/components/motion'
import { Container } from '@/components/ui'
import { formatDate } from '@/lib/utils'

interface LegalDocProps {
  title: string
  /** ISO date the text last changed — shown, because an undated policy is a smell. */
  updated: string
  summary: string
  children: React.ReactNode
}

/**
 * The shell for `/legal/privacy` and `/legal/terms` (§10.10).
 *
 * Plain prose at `--prose-max`, no card, no illustration. Legal text is read
 * linearly by someone looking for one clause, so the only design goals are
 * measure, heading contrast and an in-page anchor that survives a link.
 */
export function LegalDoc({ title, updated, summary, children }: LegalDocProps) {
  return (
    <Container width="prose" as="main" className="py-12 sm:py-16">
      <FadeIn className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-fg-muted">Last updated {formatDate(updated)}</p>
        <p className="text-lg text-fg-secondary text-pretty">{summary}</p>
      </FadeIn>

      <div className="mt-10 flex flex-col gap-8">{children}</div>

      <p className="mt-12 border-t border-line pt-6 text-sm text-fg-muted">
        Questions about any of this belong in an email to a human. See also{' '}
        <Link to="/legal/privacy" className="text-accent underline underline-offset-2">
          Privacy
        </Link>{' '}
        and{' '}
        <Link to="/legal/terms" className="text-accent underline underline-offset-2">
          Terms
        </Link>
        .
      </p>
    </Container>
  )
}

export function LegalSection({
  id,
  heading,
  children,
}: {
  id: string
  heading: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-(--topbar-h)">
      <h2 className="text-xl font-semibold text-fg">{heading}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-fg-secondary">{children}</div>
    </section>
  )
}
