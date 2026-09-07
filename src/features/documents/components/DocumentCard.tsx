import { FileText } from 'lucide-react'
import { Link } from 'react-router'
import type { DocumentRecord } from '@/lib/api'
import { cn, formatBytes, formatDateTime, formatNumber, formatRelativeTime } from '@/lib/utils'
import { DocumentActions } from './DocumentActions'
import { StatusPill } from './StatusPill'

export function DocumentCard({
  document,
  active = false,
}: {
  document: DocumentRecord
  active?: boolean
}) {
  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-surface p-4 transition-colors duration-(--dur-fast)',
        active ? 'border-accent bg-accent-wash' : 'border-line',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-wash text-accent"
        >
          <FileText className="size-4" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            to={`/app/documents/${document.id}`}
            className="truncate text-sm font-medium text-fg underline-offset-2 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
          >
            {document.filename}
          </Link>
          <time
            dateTime={document.createdAt}
            title={formatDateTime(document.createdAt)}
            className="text-xs text-fg-muted"
          >
            {formatRelativeTime(document.createdAt)}
          </time>
        </div>

        <DocumentActions document={document} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
        <StatusPill status={document.status} />
        <span aria-hidden="true">·</span>
        <span>{formatBytes(document.fileSize)}</span>
        {document.totalChunks > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>{formatNumber(document.totalChunks)} passages</span>
          </>
        )}
      </div>
    </li>
  )
}
