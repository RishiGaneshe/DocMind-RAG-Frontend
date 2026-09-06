import { ArrowUpRight, FileText } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui'
import type { Source } from '@/lib/api'
import { cn } from '@/lib/utils'

/**
 * One retrieved chunk, as a citation.
 *
 * The whole card is the link — a citation whose only target is a small "open"
 * affordance is a citation people do not follow. `?chunk=` is carried through so
 * the document view can scroll to and highlight the passage that was quoted.
 *
 * The relevance figure is written as text and the bar is decorative: a score is
 * information, and a bar alone cannot be read aloud.
 */

interface SourceCardProps {
  source: Source
  /** From the documents cache; the id is the fallback while the list loads. */
  filename?: string
  className?: string
}

export function SourceCard({ source, filename, className }: SourceCardProps) {
  const percent = Math.round(Math.max(0, Math.min(1, source.relevanceScore)) * 100)
  const label = filename ?? 'Document'

  return (
    <Link
      to={`/app/documents/${source.documentId}?chunk=${source.chunkIndex}`}
      className={cn(
        'group flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 text-left',
        'transition-colors duration-(--dur-fast) hover:border-accent/40 hover:bg-accent-wash/40',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <FileText aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{label}</span>
        <Badge tone="neutral" className="shrink-0 font-mono">
          Chunk {source.chunkIndex}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-1 flex-1 overflow-hidden rounded-full bg-surface-raised"
        >
          <span className="block h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-fg-muted">
          {percent}% match
        </span>
      </div>

      <p className="line-clamp-3 text-xs leading-relaxed text-fg-secondary">{source.snippet}</p>

      <span className="flex items-center gap-1 text-xs text-fg-muted transition-colors group-hover:text-accent">
        Open document
        <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </span>
    </Link>
  )
}
