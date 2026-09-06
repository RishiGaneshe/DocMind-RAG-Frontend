import type { ReactNode } from 'react'
import { Navigate, Outlet, useSearchParams } from 'react-router'
import { useSession } from '../hooks/useSession'

/**
 * Keeps signed-in people out of `/login` and `/signup`.
 *
 * `?next=` is honoured, but only for in-app paths: taking a redirect target
 * from the query string and handing it to the router unchecked is how open
 * redirects happen. Anything that is not a single-slash-prefixed path is
 * discarded in favour of the default landing spot.
 */

interface PublicOnlyRouteProps {
  children?: ReactNode
  fallback?: ReactNode
}

export function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export function PublicOnlyRoute({ children, fallback = null }: PublicOnlyRouteProps) {
  const { status, tenantId } = useSession()
  const [params] = useSearchParams()

  if (status === 'loading') return <>{fallback}</>

  if (status === 'authenticated') {
    const next = safeNext(params.get('next'))
    // Someone without a workspace cannot use `next` yet — /app would bounce
    // them straight back to onboarding.
    if (!tenantId) return <Navigate to="/onboarding/workspace" replace />
    return <Navigate to={next ?? '/app'} replace />
  }

  return <>{children ?? <Outlet />}</>
}
