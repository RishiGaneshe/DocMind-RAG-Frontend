import { FileText } from 'lucide-react'
import { Link } from 'react-router'
import type { DocumentRecord } from '@/lib/api'
import { cn, formatBytes, formatDateTime, formatNumber, formatRelativeTime } from '@/lib/utils'
import { DocumentActions } from './DocumentActions'
import { StatusPill } from './StatusPill'
import type { SortKey } from './DocumentFilters'

/**
 * The library at ≥lg, as a real `<table>`.
 *
 * A table because the data is tabular: five comparable attributes across many
 * rows, which is exactly what a screen reader's table mode is for. `aria-sort`
 * reports the column the Sort control is currently ordering by, so the
 * announced order matches the visual one instead of leaving assistive tech to
 * guess.
 *
 * The row is not itself a link — a clickable `<tr>` cannot be tabbed to or
 * activated by keyboard, and nesting the actions menu inside a link is worse
 * still. The filename is the link; it is the row's accessible name.
 */

/** Which column each sort key orders by, for `aria-sort`. */
const SORTED_COLUMN: Record<SortKey, 'name' | 'size' | 'chunks' | 'created'> = {
  newest: 'created',
  oldest: 'created',
  name: 'name',
  largest: 'size',
  chunks: 'chunks',
}

const DESCENDING: Record<SortKey, boolean> = {
  newest: true,
  oldest: false,
  name: false,
  largest: true,
  chunks: true,
}

const TH = 'px-4 py-2.5 text-xs font-semibold tracking-wide text-fg-muted uppercase'

interface DocumentTableProps {
  documents: DocumentRecord[]
  sort: SortKey
  /** Highlighted row — the document currently open in the detail drawer. */
  activeId?: string
  className?: string
}

export function DocumentTable({ documents, sort, activeId, className }: DocumentTableProps) {
  const sorted = SORTED_COLUMN[sort]
  const direction = DESCENDING[sort] ? 'descending' : 'ascending'
  const sortAttr = (column: 'name' | 'size' | 'chunks' | 'created') =>
    sorted === column ? direction : undefined

  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-surface', className)}>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Documents in this workspace, {formatNumber(documents.length)} shown, sorted by{' '}
          {sorted} {direction}.
        </caption>
        <thead>
          <tr className="border-b border-line bg-surface-raised/60 text-left">
            <th scope="col" aria-sort={sortAttr('name')} className={TH}>
              Document
            </th>
            <th scope="col" className={TH}>
              Status
            </th>
            <th scope="col" aria-sort={sortAttr('size')} className={cn(TH, 'text-right')}>
              Size
            </th>
            <th scope="col" aria-sort={sortAttr('chunks')} className={cn(TH, 'text-right')}>
              Passages
            </th>
            <th scope="col" aria-sort={sortAttr('created')} className={TH}>
              Uploaded
            </th>
            <th scope="col" className={cn(TH, 'w-12')}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr
              key={document.id}
              className={cn(
                'border-b border-line/70 transition-colors duration-(--dur-fast) last:border-0',
                document.id === activeId ? 'bg-accent-wash' : 'hover:bg-surface-raised/50',
              )}
            >
              <td className="max-w-0 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-8 shrink-0 place-items-center rounded-md bg-accent-wash text-accent"
                  >
                    <FileText className="size-4" />
                  </span>
                  <Link
                    to={`/app/documents/${document.id}`}
                    className="min-w-0 truncate font-medium text-fg underline-offset-2 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
                  >
                    {document.filename}
                  </Link>
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusPill status={document.status} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-fg-secondary">
                {formatBytes(document.fileSize)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-fg-secondary">
                {document.status === 'COMPLETED' || document.totalChunks > 0
                  ? formatNumber(document.totalChunks)
                  : '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-fg-secondary">
                <time dateTime={document.createdAt} title={formatDateTime(document.createdAt)}>
                  {formatRelativeTime(document.createdAt)}
                </time>
              </td>
              <td className="px-4 py-3 text-right">
                <DocumentActions document={document} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
