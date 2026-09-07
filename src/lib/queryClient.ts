import { QueryClient } from '@tanstack/react-query'
import { ApiError, isAbortError } from './api'

/**
 * Query defaults, in one place.
 *
 * The important rule is the retry policy: retrying a 400 or a 403 just burns
 * the user's time, because the answer will not change. Only transport failures
 * and server faults are worth a second attempt.
 */

const MAX_RETRIES = 2

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false
  if (isAbortError(error)) return false
  if (!(error instanceof ApiError)) return false

  // Offline / DNS / server down — very often transient.
  if (error.isNetworkError) return true
  // Rate limiting: back off and try again.
  if (error.status === 429) return true
  // A 401 that reaches here already survived the refresh-and-replay in
  // client.ts, so the session is genuinely gone.
  if (error.status >= 400 && error.status < 500) return false
  return error.status >= 500
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      // Long enough that navigating between pages does not refetch, short
      // enough that a document uploaded in another tab shows up quickly.
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      // Answers and document lists are not so volatile that regaining focus
      // should cause a flash of loading state.
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      throwOnError: false,
    },
    mutations: {
      // A failed mutation is the user's action; they decide whether to redo it.
      retry: false,
    },
  },
})

/**
 * Every key in the app. Hierarchical so a workspace change can invalidate one
 * subtree — `queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })`.
 */
export const queryKeys = {
  session: ['session'] as const,
  tenant: {
    me: ['tenant', 'me'] as const,
  },
  documents: {
    all: ['documents'] as const,
    list: (tenantId: string) => ['documents', 'list', tenantId] as const,
    detail: (tenantId: string, documentId: string) =>
      ['documents', 'detail', tenantId, documentId] as const,
  },
  apiKeys: {
    all: ['api-keys'] as const,
    list: (tenantId: string) => ['api-keys', 'list', tenantId] as const,
    usage: (tenantId: string, keyId: string) => ['api-keys', 'usage', tenantId, keyId] as const,
  },
  widget: {
    all: ['widget'] as const,
    config: (tenantId: string) => ['widget', 'config', tenantId] as const,
  },
} as const

