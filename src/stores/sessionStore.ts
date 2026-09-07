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

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous'

interface SessionState {
  status: SessionStatus
  user: User | null
  tenant: Tenant | null
  expired: boolean
  bootError: ApiError | null

  bootstrap: () => Promise<void>
  signIn: (payload: AuthPayload, remember: boolean) => void
  adoptWorkspace: (input: { tenant: Tenant; accessToken: string; refreshToken: string }) => void
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
  markExpired: () => void
  endExpiredSession: () => void
}

function tenantOf(user: User | null, fallback: Tenant | null): Tenant | null {
  return user?.tenant ?? fallback
}

export const useSessionStore = create<SessionState>()((set, get) => ({
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
      // Ignored
    }
  },

  async signOut() {
    const refreshToken = tokenStorage.getRefreshToken()
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

export const useUser = () => useSessionStore((s) => s.user)
export const useTenant = () => useSessionStore((s) => s.tenant)
export const useTenantId = () => useSessionStore((s) => s.user?.tenantId ?? s.tenant?.id ?? null)
export const useIsAuthenticated = () => useSessionStore((s) => s.status === 'authenticated')

export function currentTenantId(): string | null {
  const { user, tenant } = useSessionStore.getState()
  return user?.tenantId ?? tenant?.id ?? null
}

setSessionExpiredHandler(() => {
  useSessionStore.getState().markExpired()
})
