import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createApiKey,
  deleteApiKey,
  getKeyUsage,
  listApiKeys,
  rotateApiKey,
  updateApiKey,
  type CreateApiKeyInput,
  type UpdateApiKeyInput,
} from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { isValidUuid } from '@/lib/utils'
import { useTenantId } from '@/stores/sessionStore'

export function useApiKeysList() {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: tenantId ? queryKeys.apiKeys.list(tenantId) : queryKeys.apiKeys.all,
    queryFn: ({ signal }) => listApiKeys(tenantId as string, signal),
    enabled: Boolean(tenantId),
  })
}

export function useApiKeyUsage(keyId: string | null) {
  const tenantId = useTenantId()
  const validKeyId = keyId && isValidUuid(keyId) ? keyId : null

  return useQuery({
    queryKey:
      tenantId && validKeyId
        ? queryKeys.apiKeys.usage(tenantId, validKeyId)
        : ['api-keys', 'usage', 'none'],
    queryFn: ({ signal }) => getKeyUsage(tenantId as string, validKeyId as string, signal),
    enabled: Boolean(tenantId && validKeyId),
  })
}

export function useCreateApiKey() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateApiKeyInput) => {
      if (!tenantId) throw new Error('No workspace selected')
      return createApiKey(tenantId, input)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all })
    },
  })
}

export function useUpdateApiKey() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ keyId, input }: { keyId: string; input: UpdateApiKeyInput }) => {
      if (!tenantId) throw new Error('No workspace selected')
      return updateApiKey(tenantId, keyId, input)
    },
    onSuccess: (_, vars) => {
      toast.success('API key updated')
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all })
      if (tenantId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.apiKeys.usage(tenantId, vars.keyId),
        })
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update API key')
    },
  })
}

export function useRotateApiKey() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ keyId, graceHours }: { keyId: string; graceHours?: number }) => {
      if (!tenantId) throw new Error('No workspace selected')
      return rotateApiKey(tenantId, keyId, { graceHours })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to rotate API key')
    },
  })
}

export function useRevokeApiKey() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (keyId: string) => {
      if (!tenantId) throw new Error('No workspace selected')
      return deleteApiKey(tenantId, keyId)
    },
    onSuccess: () => {
      toast.success('API key revoked')
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to revoke API key')
    },
  })
}
