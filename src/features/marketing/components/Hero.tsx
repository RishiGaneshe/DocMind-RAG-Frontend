import { ArrowRight, FileText, Quote, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { FadeIn, OrbBackdrop } from '@/components/motion'
import { Badge, Button, Container } from '@/components/ui'

/**
 * The landing hero (§10.1).
 *
 * The visual is a hand-built static mock, not a screenshot: it stays legible at
 * 320 px, it themes with the rest of the page, and it cannot go stale when the
 * product's chrome changes. It is `aria-hidden` — everything it says is already
 * in the copy beside it, and reading a decorative transcript aloud is noise.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24">
      <OrbBackdrop />

      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <FadeIn className="flex flex-col items-start gap-6">
          <Badge tone="accent">
            <Sparkles aria-hidden="true" className="size-3" />
            Every answer cites its source
          </Badge>

          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-fg text-balance sm:text-5xl lg:text-6xl">
            Ask your documents anything.{' '}
            <span className="text-accent">Verify every word.</span>
          </h1>

          <p className="max-w-xl text-lg text-fg-secondary text-pretty">
            DocMind reads your PDFs, splits them into passages, and answers questions using only
            what it found — quoting the passage, the document and how close the match was. When it
            has nothing, it says so.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/signup">
                Create a workspace
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          <p className="text-sm text-fg-muted">
            PDF up to 10 MB · passage-level citations · workspaces isolated at the vector level
          </p>
        </FadeIn>

        <FadeIn delay={0.08} y={16} aria-hidden="true" className="relative">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-glass p-4 shadow-lg backdrop-blur-2xl sm:p-5">
            {/* Question */}
            <div className="self-end rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm text-on-accent">
              What did we commit to on data retention?
            </div>

            {/* Answer */}
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-fg">
                Customer data is deleted within{' '}
                <span className="font-medium">30 days of account closure</span>, and backups roll
                off after 90. Audit logs are kept for one year.
              </p>

              <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-3">
                <div className="flex items-center gap-2 text-xs text-fg-muted">
                  <Quote className="size-3.5 text-accent" />
                  <span className="font-medium text-fg-secondary">1 source</span>
                  <span>·</span>
                  <span>92% match</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-xs font-medium text-fg">
                      data-processing-agreement.pdf
                    </span>
                    <span className="line-clamp-2 text-xs text-fg-muted">
                      “…the Processor shall delete all Customer Personal Data within thirty (30)
                      days following termination, save for backups which expire…”
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Depth without a second card: a soft accent glow behind the panel. */}
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/5 blur-2xl" />
        </FadeIn>
      </Container>
    </section>
  )
}
