import { ArrowRight, Check, CircleDollarSign, Info } from 'lucide-react'
import { Link } from 'react-router'
import { Reveal, Stagger } from '@/components/motion'
import { Alert, Badge, Button, Card, Section } from '@/components/ui'
import { FinalCta } from '@/features/marketing/components'
import { useDocumentTitle } from '@/hooks'
import { MAX_UPLOAD_BYTES } from '@/lib/constants'
import { formatBytes } from '@/lib/utils'

const INCLUDED = [
  `PDF uploads up to ${formatBytes(MAX_UPLOAD_BYTES)} each`,
  'As many documents as you care to index',
  'Passage-level citations on every answer',
  'Streaming answers, or whole-answer delivery',
  'A workspace API key for your own scripts',
  'Owner and member roles',
]

const LIMITS = [
  ['File type', 'PDF only — text is extracted server-side'],
  ['File size', formatBytes(MAX_UPLOAD_BYTES)],
  ['Workspaces', 'One per account'],
  ['Chat history', 'Held in the browser tab, never stored'],
] as const

export default function PricingPage() {
  useDocumentTitle('Pricing')

  return (
    <>
      <Section
        align="center"
        eyebrow="Pricing"
        title="Free while DocMind is in preview"
        titleAs="h1"
        lead="No card, no trial countdown, no seat maths. When that changes you will be asked before anything is charged."
        containerWidth="lg"
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <Card elevation={2} className="flex h-full flex-col gap-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-fg">Preview</h3>
                <Badge tone="accent">Current</Badge>
              </div>

              <p className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold tracking-tight text-fg">
                  $0
                </span>
                <span className="text-sm text-fg-muted">/ month</span>
              </p>

              <ul className="flex flex-col gap-2.5">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-fg-secondary">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-3">
                <Button asChild size="lg" fullWidth>
                  <Link to="/signup">
                    Create a workspace
                    <ArrowRight />
                  </Link>
                </Button>
                <p className="text-center text-xs text-fg-muted">
                  Takes about a minute: account, workspace, first upload.
                </p>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.06}>
            <Card className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-center gap-2">
                <CircleDollarSign aria-hidden="true" className="size-4 text-fg-muted" />
                <h3 className="font-semibold text-fg">Later</h3>
              </div>
              <p className="text-sm leading-relaxed text-fg-secondary">
                When there is something to charge for it will most likely be metered on the two
                things that cost money to run: pages indexed and questions asked. Storage of your own
                documents will not be a line item.
              </p>
              <p className="text-sm leading-relaxed text-fg-secondary">
                None of that exists yet — there is no payment provider connected and no usage meter
                running, which is why this column has no numbers in it.
              </p>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Section tone="subtle" spacing="sm" title="Limits that are enforced today" containerWidth="lg">
        <Stagger onScroll className="flex flex-col gap-2">
          {LIMITS.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-fg">{label}</span>
              <span className="text-sm text-fg-muted">{value}</span>
            </div>
          ))}
        </Stagger>

        <Alert
          tone="info"
          icon={<Info className="size-4" />}
          title="A few things are not built yet"
          className="mt-4"
        >
          Documents cannot be deleted, members cannot be invited by email, and workspace details
          cannot be renamed — each of those needs an endpoint that does not exist. The interface
          names every one of these gaps where you would look for it.
        </Alert>
      </Section>

      <FinalCta />
    </>
  )
}
