import { useMutation } from '@tanstack/react-query'
import {
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  signup,
  type AuthPayload,
} from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { useSessionStore } from '@/stores/sessionStore'
import type { LoginValues, SignupValues } from '../schemas'

/**
 * One hook per auth action. Each owns the request and the session write;
 * navigation stays in the page, because only the page knows where "next" is.
 */

export function useLogin() {
  const signIn = useSessionStore((s) => s.signIn)

  return useMutation<AuthPayload, Error, LoginValues>({
    mutationFn: ({ email, password }) => login({ email, password }),
    onSuccess: (payload, values) => {
      signIn(payload, values.remember)
      // Nothing from the previous session should survive into this one.
      queryClient.clear()
    },
  })
}

export function useSignup() {
  const signIn = useSessionStore((s) => s.signIn)

  return useMutation<AuthPayload, Error, SignupValues>({
    mutationFn: ({ firstName, lastName, email, password }) =>
      signup({ firstName, lastName, email, password }),
    onSuccess: (payload) => {
      // A new account is a deliberate, long-lived intent: persist it. The user
      // can still sign out, and /app/settings/account exposes the session.
      signIn(payload, true)
      queryClient.clear()
    },
  })
}

export function useLogout() {
  const signOutStore = useSessionStore((s) => s.signOut)

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await signOutStore()
    },
  })
}

/** ⚠ Requires POST /api/auth/forgot-password (§13.3) — flagged off by default. */
export function useForgotPassword() {
  return useMutation<void, Error, { email: string }>({
    mutationFn: ({ email }) => requestPasswordReset(email),
  })
}

/** ⚠ Requires POST /api/auth/reset-password (§13.3) — flagged off by default. */
export function useResetPassword() {
  return useMutation<void, Error, { token: string; password: string }>({
    mutationFn: ({ token, password }) => resetPassword(token, password),
  })
}

export { logout as revokeRefreshToken }
