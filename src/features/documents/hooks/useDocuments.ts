import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listDocuments, type DocumentRecord } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { useTenantId } from '@/stores/sessionStore'

/**
 * The workspace's document list.
 *
 * There is exactly one list endpoint and no single-document route, so every
 * surface that needs one document reads it out of this cache instead
 * (§22 item 4). A stable empty array keeps `documents` referentially stable
 * between renders, which matters because it feeds `useMemo` deps downstream.
 */

const EMPTY: DocumentRecord[] = []

export function useDocuments() {
  const tenantId = useTenantId()

  const query = useQuery({
    // The key is tenant-scoped: signing into another workspace must not show
    // the previous one's documents while the refetch is in flight.
    queryKey: tenantId ? queryKeys.documents.list(tenantId) : queryKeys.documents.all,
    queryFn: ({ signal }) => listDocuments(tenantId as string, signal),
    enabled: Boolean(tenantId),
  })

  return {
    ...query,
    documents: query.data ?? EMPTY,
    /** True only for the first load — a background refetch must not blank the UI. */
    isInitialLoading: query.isPending && Boolean(tenantId),
  }
}

/** Header counters. Derived, never stored — the list is the source of truth. */
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

/** One document, out of the list cache. `undefined` while the list is loading. */
export function useDocument(documentId: string | undefined) {
  const { documents, isPending, isError, error, refetch } = useDocuments()
  const document = documentId ? documents.find((doc) => doc.id === documentId) : undefined

  return {
    document,
    isPending,
    isError,
    error,
    refetch,
    /** The list resolved and the id is not in it — a real 404 for this route. */
    notFound: !isPending && !isError && documentId !== undefined && document === undefined,
  }
}
