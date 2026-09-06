import { create } from 'zustand'
import {
  ApiError,
  getCurrentUser,
  logout as logoutRequest,
  setSessionExpiredHandler,
  type AuthPayload,
  type Tenant,
  type User,
} from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { tokenStorage } from '@/lib/tokenStorage'

/**
 * Who is signed in, and whether their credentials still work.
 *
 * This lives in Zustand rather than TanStack Query because it is client state
 * with a lifecycle: guards read it synchronously on every navigation, and the
 * API client writes to it from outside React when a refresh fails.
 */

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous'

interface SessionState {
  status: SessionStatus
  user: User | null
  tenant: Tenant | null
  /**
   * A background request lost the session. The app stays mounted and
   * SessionExpiredDialog takes over, so a half-typed question or a long answer
   * is not thrown away by a redirect (§11.1).
   */
  expired: boolean
  /** Set when the boot probe could not reach the server at all. */
  bootError: ApiError | null

  bootstrap: () => Promise<void>
  signIn: (payload: AuthPayload, remember: boolean) => void
  /** POST /api/tenants hands back fresh tokens carrying the tenant claim. */
  adoptWorkspace: (input: { tenant: Tenant; accessToken: string; refreshToken: string }) => void
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
  markExpired: () => void
  endExpiredSession: () => void
}

/** The JWT claim is the source of truth; `user.tenant` is just the eager-load. */
function tenantOf(user: User | null, fallback: Tenant | null): Tenant | null {
  return user?.tenant ?? fallback
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  // No stored pair means there is nothing to probe, so skip 'loading' entirely.
  // Visitors arriving at the landing or login page never see a skeleton frame.
  status: tokenStorage.get() ? 'loading' : 'anonymous',
  user: null,
  tenant: null,
  expired: false,
  bootError: null,

  async bootstrap() {
    if (!tokenStorage.get()) {
      set({ status: 'anonymous', user: null, tenant: null, bootError: null })
      return
    }

    try {
      const user = await getCurrentUser()
      set({
        status: 'authenticated',
        user,
        tenant: tenantOf(user, get().tenant),
        expired: false,
        bootError: null,
      })
    } catch (error) {
      // A 401 here means the stored pair is dead; client.ts already cleared it.
      // A network error means we simply do not know yet — keep the tokens so a
      // retry can succeed, and let the shell offer that retry.
      const bootError = error instanceof ApiError && error.isNetworkError ? error : null
      set({ status: 'anonymous', user: null, tenant: null, bootError })
    }
  },

  signIn({ user, accessToken, refreshToken }, remember) {
    tokenStorage.set({ accessToken, refreshToken }, remember)
    set({
      status: 'authenticated',
      user,
      tenant: tenantOf(user, null),
      expired: false,
      bootError: null,
    })
  },

  adoptWorkspace({ tenant, accessToken, refreshToken }) {
    // `persist` is omitted on purpose: keep whichever store the sign-in chose.
    tokenStorage.set({ accessToken, refreshToken })
    const user = get().user
    set({
      tenant,
      user: user ? { ...user, tenantId: tenant.id, tenant } : user,
    })
  },

  async refreshUser() {
    try {
      const user = await getCurrentUser()
      set({ user, tenant: tenantOf(user, get().tenant) })
    } catch {
      // Non-fatal: whatever is on screen stays, and the next guarded request
      // will surface the real problem.
    }
  },

  async signOut() {
    const refreshToken = tokenStorage.getRefreshToken()
    // Revoke server-side first, but never block the sign-out on it.
    if (refreshToken) await logoutRequest(refreshToken).catch(() => undefined)
    tokenStorage.clear()
    set({ status: 'anonymous', user: null, tenant: null, expired: false, bootError: null })
    queryClient.clear()
  },

  markExpired() {
    if (get().status !== 'authenticated') return
    set({ expired: true })
  },

  endExpiredSession() {
    tokenStorage.clear()
    set({ status: 'anonymous', user: null, tenant: null, expired: false })
    queryClient.clear()
  },
}))

/* --- Selectors ----------------------------------------------------------- */

export const useUser = () => useSessionStore((s) => s.user)
export const useTenant = () => useSessionStore((s) => s.tenant)
export const useTenantId = () => useSessionStore((s) => s.user?.tenantId ?? s.tenant?.id ?? null)
export const useIsAuthenticated = () => useSessionStore((s) => s.status === 'authenticated')

/** Read the workspace id outside React (endpoint calls inside event handlers). */
export function currentTenantId(): string | null {
  const { user, tenant } = useSessionStore.getState()
  return user?.tenantId ?? tenant?.id ?? null
}

// The API client has no way to reach React. This is the one wire between them.
setSessionExpiredHandler(() => {
  useSessionStore.getState().markExpired()
})
