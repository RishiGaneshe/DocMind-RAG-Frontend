import { Check, Copy, MessageSquare, Quote, Trash2, TriangleAlert, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  Drawer,
  DrawerContent,
  IconButton,
  Separator,
  Skeleton,
} from '@/components/ui'
import { seedComposer } from '@/features/chat/store'
import { StatusPill } from '@/features/documents/components'
import { useDeleteDocument } from '@/features/documents/hooks/useDeleteDocument'
import { useDocument } from '@/features/documents/hooks/useDocuments'
import { useCopyToClipboard, useDocumentTitle } from '@/hooks'
import { formatBytes, formatDateTime, formatNumber, formatRelativeTime, stripExtension } from '@/lib/utils'

/**
 * `/app/documents/:documentId` — one document.
 *
 * A drawer over the list on desktop and a full-screen panel below `lg`.
 * Fetches real document details directly with live polling when status is
 * PENDING or PROCESSING.
 */
export default function DocumentDetailPage() {
  const { documentId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { document, isPending, notFound } = useDocument(documentId)
  const deleteMutation = useDeleteDocument()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useDocumentTitle(document ? document.filename : 'Document')

  const chunkParam = params.get('chunk')
  const chunkIndex = chunkParam !== null && /^\d+$/.test(chunkParam) ? Number(chunkParam) : null

  const close = () => {
    void navigate('/app/documents')
  }

  const handleDelete = () => {
    if (!document) return
    deleteMutation.mutate(document.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false)
        close()
      },
    })
  }

  const isBusy = document?.status === 'PENDING' || document?.status === 'PROCESSING'

  return (
    <>
      <Drawer
        open
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <DrawerContent
          side="right"
          title={<span className="block truncate">{document?.filename ?? 'Document'}</span>}
          description={
            document ? (
              <span className="flex flex-wrap items-center gap-2">
                <StatusPill status={document.status} />
                <span>
                  added{' '}
                  <time dateTime={document.createdAt} title={formatDateTime(document.createdAt)}>
                    {formatRelativeTime(document.createdAt)}
                  </time>
                </span>
              </span>
            ) : undefined
          }
          className="max-lg:inset-0 max-lg:h-dvh max-lg:w-full max-lg:border-l-0"
        >
          <div className="flex flex-col gap-5 p-4">
            {isPending ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton lines={3} />
              </div>
            ) : notFound ? (
              <Alert tone="warning" title="That document is not in this workspace">
                It may have been removed, or the link may point at another workspace's document.
                <div className="mt-3">
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/app/documents">Back to documents</Link>
                  </Button>
                </div>
              </Alert>
            ) : document ? (
              <>
                {chunkIndex !== null && (
                  <Alert
                    tone="info"
                    icon={<Quote className="size-4" />}
                    title={`Opened from a citation — passage ${formatNumber(chunkIndex)}`}
                  >
                    The API returns passage text only inside an answer, so this page cannot show that
                    passage on its own. Ask a follow-up question to see it quoted again.
                  </Alert>
                )}

                {document.status === 'FAILED' && (
                  <Alert
                    tone="error"
                    icon={<TriangleAlert className="size-4" />}
                    title="Processing failed"
                  >
                    {document.failureReason ||
                      'No passages were indexed. Uploading it again is the only retry the API offers.'}
                  </Alert>
                )}

                {isBusy && (
                  <Alert
                    tone="info"
                    icon={<RefreshCw className="size-4 animate-spin" />}
                    title="Processing in progress"
                  >
                    Text is being extracted and vector embeddings are being generated. This view
                    updates automatically when indexing completes.
                  </Alert>
                )}

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Fact label="Passages">
                    {document.totalChunks > 0 ? formatNumber(document.totalChunks) : '—'}
                  </Fact>
                  <Fact label="Pages">
                    {document.numPages ? formatNumber(document.numPages) : '—'}
                  </Fact>
                  <Fact label="Size">{formatBytes(document.fileSize)}</Fact>
                  <Fact label="Type">{document.mimeType || 'application/pdf'}</Fact>
                  <Fact label="Uploaded">{formatDateTime(document.createdAt)}</Fact>
                  {document.processingCompletedAt && (
                    <Fact label="Processed">{formatDateTime(document.processingCompletedAt)}</Fact>
                  )}
                </dl>

                <Separator />

                <DocumentIdRow id={document.id} />

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    disabled={document.status !== 'COMPLETED'}
                    onClick={() => seedComposer(`Summarise ${stripExtension(document.filename)}`)}
                  >
                    <Link to="/app">
                      <MessageSquare />
                      Ask about this document
                    </Link>
                  </Button>

                  <Button
                    variant="danger"
                    disabled={isBusy}
                    onClick={() => setConfirmDeleteOpen(true)}
                  >
                    <Trash2 />
                    {isBusy ? 'Cannot delete while processing' : 'Delete document'}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent
          title="Delete document?"
          description={`Are you sure you want to delete "${document?.filename}"? This will permanently remove its vector embeddings and text passages from your workspace.`}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-fg-muted">
            Any questions answered in the future will no longer be able to reference or cite this document.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="truncate text-fg">{children}</dd>
    </div>
  )
}

function DocumentIdRow({ id }: { id: string }) {
  const { copy, copied } = useCopyToClipboard()

  return (
    <div className="flex items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xs text-fg-muted">Document ID</span>
        <code className="truncate font-mono text-xs text-fg-secondary">{id}</code>
      </div>
      <IconButton
        label={copied ? 'Copied' : 'Copy document ID'}
        icon={copied ? <Check /> : <Copy />}
        size="sm"
        onClick={() => void copy(id)}
      />
    </div>
  )
}
