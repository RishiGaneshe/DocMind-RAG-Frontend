import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { ApiError, uploadDocument, type UploadResult } from '@/lib/api'
import { ACCEPTED_UPLOAD_EXT, ACCEPTED_UPLOAD_MIME, MAX_UPLOAD_BYTES } from '@/lib/constants'
import { queryKeys } from '@/lib/queryClient'
import { formatBytes } from '@/lib/utils'
import { useTenantId } from '@/stores/sessionStore'

/**
 * One upload at a time, with real progress.
 *
 * Validation happens here as well as on the server. Sending a 40 MB file just to
 * be told multer rejected it wastes the user's bandwidth and their time, and the
 * server's message ("File too large") cannot say what the limit is in the terms
 * the user chose the file in.
 */

/** Returns a human-readable reason, or null when the file is acceptable. */
export function validateFile(file: File): string | null {
  const looksPdf =
    file.type === ACCEPTED_UPLOAD_MIME || file.name.toLowerCase().endsWith(ACCEPTED_UPLOAD_EXT)

  // Some systems report an empty type for a dragged file, so the extension is
  // the fallback rather than the primary check.
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
      // The new row, its chunk count and the sidebar's recents all come from the
      // one list query.
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
    /** 0–1 of bytes sent. Embedding happens after this reaches 1. */
    progress,
    isUploading: mutation.isPending,
    result: mutation.data,
    error: mutation.error,
    cancel,
    reset,
  }
}
