import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { ApiError, uploadDocument, type UploadResult } from '@/lib/api'
import { ACCEPTED_UPLOAD_EXT, ACCEPTED_UPLOAD_MIME, MAX_UPLOAD_BYTES } from '@/lib/constants'
import { queryKeys } from '@/lib/queryClient'
import { formatBytes } from '@/lib/utils'
import { useTenantId } from '@/stores/sessionStore'

export function validateFile(file: File): string | null {
  const looksPdf =
    file.type === ACCEPTED_UPLOAD_MIME || file.name.toLowerCase().endsWith(ACCEPTED_UPLOAD_EXT)

  if (!looksPdf) return 'Only PDF files can be processed. This one is not a PDF.'
  if (file.size === 0) return 'That file is empty.'
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`
  }
  return null
}

export function useUploadDocument() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(0)
  const controller = useRef<AbortController | null>(null)

  const mutation = useMutation<UploadResult, ApiError, File>({
    mutationFn: async (file) => {
      if (!tenantId) throw new ApiError('No workspace is selected.', 403, 'TENANT_REQUIRED')
      controller.current = new AbortController()
      setProgress(0)
      return uploadDocument({
        tenantId,
        file,
        onProgress: setProgress,
        signal: controller.current.signal,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
    },
    onSettled: () => {
      controller.current = null
    },
  })

  const cancel = useCallback(() => {
    controller.current?.abort()
  }, [])

  const reset = useCallback(() => {
    setProgress(0)
    mutation.reset()
  }, [mutation])

  return {
    upload: mutation.mutate,
    progress,
    isUploading: mutation.isPending,
    result: mutation.data,
    error: mutation.error,
    cancel,
    reset,
  }
}
