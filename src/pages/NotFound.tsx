import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Link } from 'react-router'
import { Button, Container } from '@/components/ui'
import { FadeIn, OrbBackdrop } from '@/components/motion'
import { useDocumentTitle } from '@/hooks'
import { useSession } from '@/features/auth/hooks/useSession'

/**
 * `/*` — the marketing-chrome 404 (§11).
 *
 * The primary action depends on who is asking: a signed-in user wants their
 * workspace back, a visitor wants the front door. A single hard-coded "go home"
 * would be wrong for one of them.
 */
export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  const { isAuthenticated, tenantId } = useSession()
  const home = isAuthenticated && tenantId ? '/app' : '/'

  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden py-16">
      <OrbBackdrop subtle />
      <Container width="md">
        <FadeIn className="flex flex-col items-center gap-5 text-center">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-2xl bg-accent-wash text-accent"
          >
            <FileQuestion className="size-7" />
          </span>

          <p className="font-mono text-sm tracking-widest text-fg-muted uppercase">Error 404</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            We cannot find that page
          </h1>
          <p className="max-w-md text-base text-fg-secondary text-pretty">
            The link may be out of date, or the page may have moved. Nothing is broken on your side.
          </p>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link to={home}>
                <ArrowLeft />
                {home === '/app' ? 'Back to workspace' : 'Back to home'}
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </FadeIn>
      </Container>
    </main>
  )
}
