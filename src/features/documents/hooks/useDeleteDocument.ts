import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError, deleteDocument, type DeleteDocumentResult } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { useTenantId } from '@/stores/sessionStore'

export function useDeleteDocument() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation<DeleteDocumentResult, ApiError, string>({
    mutationFn: async (documentId: string) => {
      if (!tenantId) throw new ApiError('No workspace selected', 403, 'TENANT_REQUIRED')
      return deleteDocument(tenantId, documentId)
    },
    onSuccess: (data) => {
      toast.success('Document deleted', {
        description: data.vectorsDeleted
          ? `Removed document and ${data.vectorsDeleted} vector passages.`
          : 'Document removed from workspace.',
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
    },
    onError: (error) => {
      if (error.status === 409) {
        toast.error('Document is currently being processed', {
          description: 'Wait until indexing has completed before deleting.',
        })
      } else {
        toast.error('Failed to delete document', {
          description: error.message || 'An unexpected error occurred.',
        })
      }
    },
  })
}
