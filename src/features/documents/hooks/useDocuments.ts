import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getDocument, listDocuments, type DocumentRecord } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { useTenantId } from '@/stores/sessionStore'

const EMPTY: DocumentRecord[] = []

export function useDocuments() {
  const tenantId = useTenantId()

  const query = useQuery({
    queryKey: tenantId ? queryKeys.documents.list(tenantId) : queryKeys.documents.all,
    queryFn: ({ signal }) => listDocuments(tenantId as string, signal),
    enabled: Boolean(tenantId),
    refetchInterval: (query) => {
      const docs = query.state.data ?? []
      const hasBusy = docs.some((d) => d.status === 'PENDING' || d.status === 'PROCESSING')
      return hasBusy ? 3000 : false
    },
  })

  return {
    ...query,
    documents: query.data ?? EMPTY,
    isInitialLoading: query.isPending && Boolean(tenantId),
  }
}

export function useDocumentStats(documents: DocumentRecord[]) {
  return useMemo(() => {
    let bytes = 0
    let chunks = 0
    let ready = 0
    let failed = 0
    let processing = 0

    for (const doc of documents) {
      bytes += doc.fileSize
      chunks += doc.totalChunks
      if (doc.status === 'COMPLETED') ready += 1
      else if (doc.status === 'FAILED') failed += 1
      else processing += 1
    }

    return { count: documents.length, bytes, chunks, ready, failed, processing }
  }, [documents])
}

export function useDocument(documentId: string | undefined) {
  const tenantId = useTenantId()
  const { documents } = useDocuments()

  const cachedFromList = documentId ? documents.find((doc) => doc.id === documentId) : undefined

  const query = useQuery({
    queryKey:
      tenantId && documentId
        ? queryKeys.documents.detail(tenantId, documentId)
        : ['documents', 'detail', 'none'],
    queryFn: async ({ signal }) => {
      if (!tenantId || !documentId) throw new Error('Tenant and Document ID required')
      const res = await getDocument(tenantId, documentId, signal)
      return res.document
    },
    enabled: Boolean(tenantId && documentId),
    initialData: cachedFromList,
    refetchInterval: (q) => {
      const status = q.state.data?.status
      return status === 'PENDING' || status === 'PROCESSING' ? 2500 : false
    },
  })

  const document = query.data ?? cachedFromList

  return {
    document,
    isPending: query.isPending && !cachedFromList,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    notFound: query.isError && (query.error as { status?: number })?.status === 404,
  }
}
