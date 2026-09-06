import { ShieldOff } from 'lucide-react'
import { Link } from 'react-router'
import { Button, Container } from '@/components/ui'
import { FadeIn, OrbBackdrop } from '@/components/motion'
import { useSession } from '@/features/auth/hooks/useSession'
import { useLogout } from '@/features/auth/hooks/useAuthMutations'
import { useDocumentTitle } from '@/hooks'

/**
 * `/403` — reached on a `TENANT_MISMATCH` (§11.1, §12.6).
 *
 * The only real remedies are "go to the workspace your token actually belongs
 * to" and "sign in as someone else", so those are the two actions. There is no
 * workspace *switcher* to offer: the API issues one tenant per token, and
 * membership of a second workspace is not something the backend models yet.
 */
export default function ForbiddenPage() {
  useDocumentTitle('Access denied')
  const { tenant, tenantId } = useSession()
  const logout = useLogout()

  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden py-16">
      <OrbBackdrop subtle />
      <Container width="md">
        <FadeIn className="flex flex-col items-center gap-5 text-center">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-2xl bg-wash-error text-error"
          >
            <ShieldOff className="size-7" />
          </span>

          <p className="font-mono text-sm tracking-widest text-fg-muted uppercase">Error 403</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            You do not have access to that workspace
          </h1>
          <p className="max-w-md text-base text-fg-secondary text-pretty">
            {tenant
              ? `Your session belongs to ${tenant.name}. Documents and answers never cross workspace boundaries, so this request was refused.`
              : 'Your session is not attached to the workspace that resource belongs to.'}
          </p>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {tenantId && (
              <Button asChild size="lg">
                <Link to="/app">Go to my workspace</Link>
              </Button>
            )}
            <Button
              size="lg"
              variant="secondary"
              loading={logout.isPending}
              onClick={() => logout.mutate()}
            >
              Sign in as someone else
            </Button>
          </div>
        </FadeIn>
      </Container>
    </main>
  )
}
