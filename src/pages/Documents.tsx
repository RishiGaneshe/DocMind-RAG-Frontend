import { FileText, FolderOpen, Search, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Outlet, useMatch } from 'react-router'
import { Button, Container, EmptyState, ErrorState, Skeleton } from '@/components/ui'
import {
  DocumentCard,
  DocumentFilters,
  DocumentTable,
  type SortKey,
  type StatusFilter,
} from '@/features/documents/components'
import { useDocuments, useDocumentStats } from '@/features/documents/hooks/useDocuments'
import { useDocumentTitle } from '@/hooks'
import { ApiError, type DocumentRecord } from '@/lib/api'
import { formatBytes, formatNumber } from '@/lib/utils'

/**
 * `/app/documents` — the library.
 *
 * The list is the only document endpoint the API has, so this page is also the
 * cache that `/app/documents/:documentId` reads from. Both the upload dialog and
 * the detail drawer are child routes rendered through `<Outlet />`: the list
 * stays mounted and visible behind them, which is the point of putting them on
 * URLs at all — a link to one document does not throw away the list.
 */

const COMPARATORS: Record<SortKey, (a: DocumentRecord, b: DocumentRecord) => number> = {
  newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  oldest: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  name: (a, b) => a.filename.localeCompare(b.filename, undefined, { sensitivity: 'base' }),
  largest: (a, b) => b.fileSize - a.fileSize,
  chunks: (a, b) => b.totalChunks - a.totalChunks,
}

export default function DocumentsPage() {
  useDocumentTitle('Documents')

  const { documents, isInitialLoading, isError, error, refetch } = useDocuments()
  const stats = useDocumentStats(documents)

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [sort, setSort] = useState<SortKey>('newest')

  // `/app/documents/upload` shares the `:documentId` shape, so the literal has
  // to be excluded before treating the segment as an id.
  const detail = useMatch('/app/documents/:documentId')
  const activeId =
    detail?.params.documentId && detail.params.documentId !== 'upload'
      ? detail.params.documentId
      : undefined

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return documents
      .filter((document) => {
        if (status !== 'ALL' && document.status !== status) return false
        if (needle && !document.filename.toLowerCase().includes(needle)) return false
        return true
      })
      .sort(COMPARATORS[sort])
  }, [documents, query, status, sort])

  const filtering = query.trim() !== '' || status !== 'ALL'

  return (
    <>
      <Container width="lg" className="flex flex-col gap-6 py-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-fg">Documents</h1>
            <p className="text-sm text-fg-muted">
              {isInitialLoading ? (
                'Loading your library…'
              ) : stats.count === 0 ? (
                'Nothing here yet. Upload a PDF to make it searchable.'
              ) : (
                <>
                  {formatNumber(stats.count)} {stats.count === 1 ? 'document' : 'documents'} ·{' '}
                  {formatNumber(stats.chunks)} passages · {formatBytes(stats.bytes)}
                  {stats.processing > 0 && ` · ${formatNumber(stats.processing)} still processing`}
                  {stats.failed > 0 && ` · ${formatNumber(stats.failed)} failed`}
                </>
              )}
            </p>
          </div>

          <Button asChild className="sm:shrink-0">
            <Link to="/app/documents/upload">
              <Upload />
              Upload a PDF
            </Link>
          </Button>
        </header>

        {isError ? (
          <ErrorState
            title="The document list could not be loaded"
            description={
              error instanceof ApiError && error.isNetworkError
                ? 'Could not reach the server. Check your connection and try again.'
                : (error?.message ?? 'The request did not complete.')
            }
            onRetry={() => void refetch()}
          />
        ) : isInitialLoading ? (
          <LoadingList />
        ) : stats.count === 0 ? (
          <EmptyState
            icon={<FolderOpen />}
            title="No documents yet"
            description="Upload a PDF and DocMind will split it into passages, embed them, and answer questions from what it finds."
            secondaryAction={
              <Button asChild>
                <Link to="/app/documents/upload">
                  <Upload />
                  Upload a PDF
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            <DocumentFilters
              query={query}
              onQueryChange={setQuery}
              status={status}
              onStatusChange={setStatus}
              sort={sort}
              onSortChange={setSort}
            />

            {/* The count is announced, not just drawn, because filtering happens
                as you type and the only feedback is the list length. */}
            <p aria-live="polite" className="text-xs text-fg-muted">
              {filtering
                ? `${formatNumber(visible.length)} of ${formatNumber(stats.count)} shown`
                : `${formatNumber(stats.count)} ${stats.count === 1 ? 'document' : 'documents'}`}
            </p>

            {visible.length === 0 ? (
              <EmptyState
                size="sm"
                icon={<Search />}
                title="No documents match"
                description="Try a different spelling, or clear the status filter."
                secondaryAction={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery('')
                      setStatus('ALL')
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                <DocumentTable
                  documents={visible}
                  sort={sort}
                  activeId={activeId}
                  className="hidden lg:block"
                />
                <ul className="flex flex-col gap-3 lg:hidden">
                  {visible.map((document) => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      active={document.id === activeId}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </Container>

      {/* Upload dialog and detail drawer. */}
      <Outlet />
    </>
  )
}

function LoadingList() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <span className="sr-only" role="status">
        Loading documents
      </span>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-line p-4">
          <Skeleton className="size-9 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-24" />
          </div>
          <FileText aria-hidden="true" className="size-4 shrink-0 text-fg-muted/40" />
        </div>
      ))}
    </div>
  )
}
