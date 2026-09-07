import { QueryClient } from '@tanstack/react-query'
import { ApiError, isAbortError } from './api'

const MAX_RETRIES = 2

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false
  if (isAbortError(error)) return false
  if (!(error instanceof ApiError)) return false

  if (error.isNetworkError) return true
  if (error.status === 429) return true
  if (error.status >= 400 && error.status < 500) return false
  return error.status >= 500
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      throwOnError: false,
    },
    mutations: {
      retry: false,
    },
  },
})

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
