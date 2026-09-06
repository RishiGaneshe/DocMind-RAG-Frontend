import { useEffect } from 'react'
import { useSessionStore } from '@/stores/sessionStore'

/**
 * Runs the session probe exactly once per page load.
 *
 * The module-level flag matters in development: React 19's StrictMode mounts
 * every effect twice, and two `/api/auth/me` calls racing each other is noise
 * in the network panel and in the logs.
 */
let started = false

export function useSessionBootstrap(): void {
  useEffect(() => {
    if (started) return
    started = true
    void useSessionStore.getState().bootstrap()
  }, [])
}

/** Re-runs the probe after a failed boot (offline, server not up yet). */
export function retrySessionBootstrap(): void {
  void useSessionStore.getState().bootstrap()
}

export function useSession() {
  const status = useSessionStore((s) => s.status)
  const user = useSessionStore((s) => s.user)
  const tenant = useSessionStore((s) => s.tenant)
  const expired = useSessionStore((s) => s.expired)
  const bootError = useSessionStore((s) => s.bootError)
  const tenantId = user?.tenantId ?? tenant?.id ?? null

  return {
    status,
    user,
    tenant,
    tenantId,
    expired,
    bootError,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    /** Signed in but has not created a workspace — the onboarding condition. */
    needsWorkspace: status === 'authenticated' && !tenantId,
  }
}
