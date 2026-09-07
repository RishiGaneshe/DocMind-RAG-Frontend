import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getWidgetConfig,
  updateWidgetConfig,
  type WidgetConfig,
} from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { useTenantId } from '@/stores/sessionStore'

export function useWidgetConfig() {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: tenantId ? queryKeys.widget.config(tenantId) : queryKeys.widget.all,
    queryFn: ({ signal }) => getWidgetConfig(tenantId as string, signal),
    enabled: Boolean(tenantId),
    select: (data) => data.widget,
  })
}

export function useUpdateWidgetConfig() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Partial<WidgetConfig>) => {
      if (!tenantId) throw new Error('No workspace selected')
      return updateWidgetConfig(tenantId, input)
    },
    onSuccess: (data) => {
      toast.success('Widget configuration saved')
      if (tenantId) {
        queryClient.setQueryData(queryKeys.widget.config(tenantId), data)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update widget configuration')
    },
  })
}
