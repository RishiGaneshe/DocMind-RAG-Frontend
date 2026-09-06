import { Check, Copy, MessageSquare, Quote, TriangleAlert } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import {
  Alert,
  Button,
  Drawer,
  DrawerContent,
  IconButton,
  Separator,
  Skeleton,
} from '@/components/ui'
import { seedComposer } from '@/features/chat/store'
import { StatusPill } from '@/features/documents/components'
import { useDocument } from '@/features/documents/hooks/useDocuments'
import { useCopyToClipboard, useDocumentTitle } from '@/hooks'
import { formatBytes, formatDateTime, formatNumber, formatRelativeTime, stripExtension } from '@/lib/utils'

/**
 * `/app/documents/:documentId` — one document.
 *
 * A drawer over the list on desktop and a full-screen panel below `lg`, because
 * there is no separate page's worth of content: the API has no single-document
 * route and no passage-text route, so everything shown here comes from the list
 * record (§22 item 4). Presenting that as a full page would promise detail that
 * does not exist.
 *
 * `?chunk=` arrives from a citation in an answer. It cannot scroll to the
 * passage — nothing serves passage text — so it is acknowledged rather than
 * silently dropped.
 */
export default function DocumentDetailPage() {
  const { documentId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { document, isPending, notFound } = useDocument(documentId)

  useDocumentTitle(document ? document.filename : 'Document')

  const chunkParam = params.get('chunk')
  const chunkIndex = chunkParam !== null && /^\d+$/.test(chunkParam) ? Number(chunkParam) : null

  const close = () => {
    void navigate('/app/documents')
  }

  return (
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
        // Below lg there is no list to sit beside, so the panel takes the screen.
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
                  No passages were indexed, so this document cannot appear in answers. Uploading it
                  again is the only retry the API offers.
                </Alert>
              )}

              {(document.status === 'PENDING' || document.status === 'PROCESSING') && (
                <Alert tone="info" title="Still being indexed">
                  Passages are still being embedded. The list refreshes when you return to it.
                </Alert>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Fact label="Passages">
                  {document.totalChunks > 0 ? formatNumber(document.totalChunks) : '—'}
                </Fact>
                <Fact label="Size">{formatBytes(document.fileSize)}</Fact>
                <Fact label="Type">{document.mimeType || 'application/pdf'}</Fact>
                <Fact label="Uploaded">{formatDateTime(document.createdAt)}</Fact>
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
                <p className="text-xs text-fg-muted">
                  Deleting a document is not possible yet — the API has no delete route.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
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
