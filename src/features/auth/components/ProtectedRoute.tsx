import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../hooks/useSession'

/**
 * The gate in front of `/app/*` and `/onboarding/*` (§11.1).
 *
 * It never renders a full-page spinner: while the session probe is in flight
 * the caller's `fallback` — a skeleton of the page that is about to appear —
 * holds the layout, so navigation does not feel like a reload.
 */

interface ProtectedRouteProps {
  children?: ReactNode
  fallback?: ReactNode
  /** `/app/*` needs a workspace; `/onboarding/*` is where you go to get one. */
  requireTenant?: boolean
  /** Where to send someone who already has a workspace (onboarding only). */
  redirectIfTenant?: string
}

export function ProtectedRoute({
  children,
  fallback = null,
  requireTenant = true,
  redirectIfTenant,
}: ProtectedRouteProps) {
  const { status, tenantId } = useSession()
  const location = useLocation()

  if (status === 'loading') return <>{fallback}</>

  if (status !== 'authenticated') {
    // Preserve the whole target — a deep link to a document should survive the
    // detour through sign-in.
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (requireTenant && !tenantId) return <Navigate to="/onboarding/workspace" replace />
  if (redirectIfTenant && tenantId) return <Navigate to={redirectIfTenant} replace />

  return <>{children ?? <Outlet />}</>
}
