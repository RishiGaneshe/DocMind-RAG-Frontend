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

export function useLogin() {
  const signIn = useSessionStore((s) => s.signIn)

  return useMutation<AuthPayload, Error, LoginValues>({
    mutationFn: ({ email, password }) => login({ email, password }),
    onSuccess: (payload, values) => {
      signIn(payload, values.remember)
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

export function useForgotPassword() {
  return useMutation<void, Error, { email: string }>({
    mutationFn: ({ email }) => requestPasswordReset(email),
  })
}

export function useResetPassword() {
  return useMutation<void, Error, { token: string; password: string }>({
    mutationFn: ({ token, password }) => resetPassword(token, password),
  })
}

export { logout as revokeRefreshToken }
