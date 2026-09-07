import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../hooks/useSession'

interface ProtectedRouteProps {
  children?: ReactNode
  fallback?: ReactNode
  requireTenant?: boolean
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
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (requireTenant && !tenantId) return <Navigate to="/onboarding/workspace" replace />
  if (redirectIfTenant && tenantId) return <Navigate to={redirectIfTenant} replace />

  return <>{children ?? <Outlet />}</>
}
