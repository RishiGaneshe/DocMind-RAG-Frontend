import {
  ArrowRight,
  BookOpen,
  Database,
  FileUp,
  Fingerprint,
  Gauge,
  KeyRound,
  Layers,
  Lock,
  MessageSquareQuote,
  Radio,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router'
import { Reveal, Stagger } from '@/components/motion'
import { Badge, Button, Card, Container, Section } from '@/components/ui'
import { MAX_UPLOAD_BYTES } from '@/lib/constants'

/**
 * The landing page's body sections (§10.2–§10.8), kept out of `pages/Landing.tsx`
 * so the page reads as an outline of itself.
 *
 * Everything claimed here is something the running backend actually does. No
 * invented integrations, no logo wall of companies that have never used this, no
 * "trusted by 10,000 teams" — the product is new, and a landing page that lies
 * about traction is the fastest way to lose the reader who reads carefully.
 */

/** The limit is one number in one place; the copy derives it. */
const MAX_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))

const STEPS = [
  {
    icon: FileUp,
    title: 'Upload a PDF',
    body: `Drop in a contract, a policy, a manual — anything up to ${MAX_MB} MB. Text is extracted on the server; the file never goes to a third-party parser.`,
  },
  {
    icon: Layers,
    title: 'It becomes passages',
    body: 'The text is split into overlapping passages, each embedded as a vector and stored under your workspace alone. Overlap is what keeps a sentence that straddles a boundary findable.',
  },
  {
    icon: MessageSquareQuote,
    title: 'Ask, and check',
    body: 'Your question is embedded the same way, the closest passages are retrieved, and the answer is written from those passages only — with each one quoted beside it.',
  },
]

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      tone="subtle"
      eyebrow="How it works"
      title="Three steps, and nothing hidden between them"
      lead="Retrieval-augmented generation, described plainly: find the relevant passages first, then answer from them."
    >
      <Stagger onScroll className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <Card key={step.title} elevation={2} className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-wash text-accent">
                <step.icon aria-hidden="true" className="size-4.5" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-fg-muted uppercase">
                Step {index + 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-fg">{step.title}</h3>
            <p className="text-sm leading-relaxed text-fg-secondary">{step.body}</p>
          </Card>
        ))}
      </Stagger>
    </Section>
  )
}

const CAPABILITIES = [
  {
    icon: MessageSquareQuote,
    title: 'Passage-level citations',
    body: 'Every answer arrives with the passages it used, the document each came from, and a similarity score. Open one and read the sentence yourself.',
  },
  {
    icon: ShieldCheck,
    title: 'It refuses rather than guesses',
    body: 'When retrieval finds nothing close enough, the answer says so. A confident invention is worse than an admission.',
  },
  {
    icon: Radio,
    title: 'Streaming by default',
    body: 'Answers stream token by token so you can start reading immediately — and can be switched off in Settings when the connection is slow.',
  },
  {
    icon: Fingerprint,
    title: 'Workspaces cannot see each other',
    body: 'Documents, vectors and queries are scoped to one workspace at the database and vector-index level, not filtered in the UI.',
  },
  {
    icon: ScanSearch,
    title: 'Semantic, not keyword',
    body: '“What happens if we cancel early?” finds the termination clause even when the words never match.',
  },
  {
    icon: KeyRound,
    title: 'An API key for your own tooling',
    body: 'Each workspace gets a key for server-to-server calls, so a script can query the same index the UI does.',
  },
]

export function Capabilities() {
  return (
    <Section
      id="capabilities"
      eyebrow="What you get"
      title="Built for answers you can hand to someone else"
      lead="Anything that cannot be traced back to a document is not worth pasting into a decision."
    >
      <Stagger onScroll className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((item) => (
          <Card key={item.title} className="flex flex-col gap-3 p-5">
            <item.icon aria-hidden="true" className="size-5 text-accent" />
            <h3 className="font-semibold text-fg">{item.title}</h3>
            <p className="text-sm leading-relaxed text-fg-secondary">{item.body}</p>
          </Card>
        ))}
      </Stagger>
    </Section>
  )
}

const ANATOMY = [
  ['The answer', 'Written only from the retrieved passages — never from the model’s memory of the world.'],
  ['A similarity score', 'How close the best passage was. A low score is a signal to read the source before you trust the summary.'],
  ['The document', 'Which file it came from, linking to that document in your library.'],
  ['The passage itself', 'The quoted text, so the check takes two seconds instead of a search through a 90-page PDF.'],
] as const

export function Verifiable() {
  return (
    <Section tone="subtle" id="citations">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="flex flex-col gap-4">
          <Badge tone="accent">
            <BookOpen aria-hidden="true" className="size-3" />
            Anatomy of an answer
          </Badge>
          <h2 className="text-3xl font-semibold text-fg text-balance">
            Four things come back, every time
          </h2>
          <p className="text-lg text-fg-secondary text-pretty">
            A chatbot that sounds sure of itself is easy to build. The useful part is being able to
            disagree with it — which needs the evidence attached.
          </p>
          <dl className="mt-2 flex flex-col gap-4">
            {ANATOMY.map(([term, description], index) => (
              <div key={term} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-wash text-xs font-semibold text-accent"
                >
                  {index + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <dt className="font-medium text-fg">{term}</dt>
                  <dd className="text-sm leading-relaxed text-fg-secondary">{description}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.06} className="lg:pl-4">
          <AnswerMock />
        </Reveal>
      </div>
    </Section>
  )
}

/**
 * A labelled diagram of a real answer. `aria-hidden` for the same reason as the
 * hero mock: the list beside it already says all of this in prose.
 */
function AnswerMock() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <p className="text-sm leading-relaxed text-fg">
        Either party may terminate for convenience with{' '}
        <span className="font-medium">60 days’ written notice</span>. Fees already paid are not
        refunded.
      </p>

      <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-fg-secondary">Source 1 of 2</span>
          <span className="rounded-full bg-accent-wash px-2 py-0.5 text-xs font-medium text-accent">
            88% match
          </span>
        </div>
        <span className="truncate text-xs font-medium text-fg">master-services-agreement.pdf</span>
        <p className="border-l-2 border-accent/40 pl-2 text-xs leading-relaxed text-fg-muted">
          “…either party may terminate this Agreement for convenience upon sixty (60) days’ prior
          written notice to the other party…”
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-xs text-fg-muted">
        <Sparkles className="size-3.5 shrink-0 text-accent" />
        No passage cleared the threshold? The answer says it has nothing, and shows no sources.
      </div>
    </div>
  )
}

const GUARANTEES = [
  {
    icon: Lock,
    title: 'One workspace, one namespace',
    body: 'Every document row carries its workspace id and every vector lives in that workspace’s namespace. A query cannot reach outside it, because the search never sees the other partition.',
  },
  {
    icon: KeyRound,
    title: 'Tokens, not sessions you cannot end',
    body: 'Passwords are stored as bcrypt hashes. Signing in issues a short-lived access token plus a refresh token, and signing out revokes the refresh token on the server.',
  },
  {
    icon: ShieldCheck,
    title: 'Uploads are checked on the server',
    body: `Type and size are enforced where it counts, not in the browser: PDF only, ${MAX_MB} MB maximum, rejected before anything is stored.`,
  },
  {
    icon: Gauge,
    title: 'Only the passages leave',
    body: 'Answer generation receives your question and the retrieved passages — not your library. Nothing is embedded or sent until you upload it.',
  },
]

export function Isolation() {
  return (
    <Section
      id="security"
      eyebrow="Isolation"
      title="Multi-tenant where it matters: at the data layer"
      lead="Filtering results in the interface is not isolation. These boundaries sit underneath it."
    >
      <Stagger onScroll className="grid gap-4 sm:grid-cols-2">
        {GUARANTEES.map((item) => (
          <Card key={item.title} elevation={2} className="flex gap-4 p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-wash text-accent">
              <item.icon aria-hidden="true" className="size-4.5" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-semibold text-fg">{item.title}</h3>
              <p className="text-sm leading-relaxed text-fg-secondary">{item.body}</p>
            </div>
          </Card>
        ))}
      </Stagger>
    </Section>
  )
}

const STACK = [
  ['Voyage AI', 'voyage-4 embeddings for both passages and questions'],
  ['Pinecone', 'vector search, one namespace per workspace'],
  ['Groq', 'answer generation from the retrieved passages'],
  ['PostgreSQL', 'accounts, workspaces and document metadata'],
  ['Express', 'the API this interface talks to'],
  ['React 19 · Vite · Tailwind 4', 'this interface'],
] as const

export function UnderTheHood() {
  return (
    <Section tone="subtle" id="stack" spacing="sm">
      <Reveal className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
            Under the hood
          </p>
          <h2 className="text-2xl font-semibold text-fg">No mystery box</h2>
        </div>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map(([name, role]) => (
            <div key={name} className="flex flex-col gap-0.5 border-l-2 border-line pl-3">
              <dt className="flex items-center gap-2 text-sm font-medium text-fg">
                <Database aria-hidden="true" className="size-3.5 text-accent" />
                {name}
              </dt>
              <dd className="text-sm text-fg-muted">{role}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  )
}

const FAQ = [
  {
    q: 'What can I upload?',
    a: `PDFs, up to ${MAX_MB} MB each. Text is extracted on the server, so a scanned page with no text layer will index as an empty document — if a file comes back with no passages, that is usually why.`,
  },
  {
    q: 'What happens when the answer isn’t in my documents?',
    a: 'You are told that, and no sources are shown. The alternative — a plausible paragraph assembled from the model’s general knowledge — is exactly what this product exists to avoid.',
  },
  {
    q: 'Can I delete a document?',
    a: 'Not yet. The API has no delete route, so the library is add-only for now and the interface says so rather than offering a button that would fail.',
  },
  {
    q: 'Is my chat history saved?',
    a: 'No. A thread lives in the browser tab and is gone when you reload or sign out. Your documents and their passages persist; the conversation does not.',
  },
  {
    q: 'Can I invite a colleague?',
    a: 'Workspaces already carry owners and members, but there is no invite endpoint yet, so a second account has to be attached to the workspace directly. It is listed as a gap in Settings, not hidden.',
  },
  {
    q: 'How is this different from pasting a PDF into a chatbot?',
    a: 'A pasted document is limited by the context window and gives you no way to check the reply. Here the passages are searched, only the relevant ones are used, and each one is shown to you.',
  },
]

export function Faq() {
  return (
    <Section
      id="faq"
      eyebrow="Questions"
      title="Including the ones with awkward answers"
      containerWidth="lg"
    >
      <Stagger onScroll className="flex flex-col gap-2">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-lg border border-line bg-surface px-4 open:bg-surface-raised"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)">
              {item.q}
              <span
                aria-hidden="true"
                className="shrink-0 text-fg-muted transition-transform duration-(--dur-fast) group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-fg-secondary">{item.a}</p>
          </details>
        ))}
      </Stagger>
    </Section>
  )
}

export function FinalCta() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-line bg-accent-wash px-6 py-12 text-center sm:px-12">
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-fg text-balance sm:text-4xl">
              Put your documents somewhere that shows its work
            </h2>
            <p className="max-w-xl text-fg-secondary text-pretty">
              Create a workspace, upload one PDF, and ask it something you already know the answer
              to. That is the only fair way to judge a system like this.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/signup">
                  Create a workspace
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
            <p className="text-sm text-fg-muted">
              No card required. Nothing is indexed until you upload it.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
