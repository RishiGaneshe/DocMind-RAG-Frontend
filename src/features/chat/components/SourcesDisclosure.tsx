import { Quote } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui'
import { useDocuments } from '@/features/documents/hooks/useDocuments'
import type { Source } from '@/lib/api'
import { SourceCard } from './SourceCard'

/**
 * Citations under an answer, collapsed by default.
 *
 * Collapsed is the right default because the answer is what was asked for and
 * five chunks of quoted PDF would bury it — but the count stays visible, so the
 * evidence never feels hidden. Opening one panel does not open the others: each
 * answer owns its own state.
 */

interface SourcesDisclosureProps {
  sources: Source[]
  /** From the `sources` frame: how many chunks actually reached the model. */
  chunksUsed?: number
  defaultOpen?: boolean
}

export function SourcesDisclosure({
  sources,
  chunksUsed,
  defaultOpen = false,
}: SourcesDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { documents } = useDocuments()

  // One pass over the list instead of a lookup per card.
  const names = useMemo(() => {
    const map = new Map<string, string>()
    for (const doc of documents) map.set(doc.id, doc.filename)
    return map
  }, [documents])

  if (sources.length === 0) return null

  const count = `${sources.length} ${sources.length === 1 ? 'source' : 'sources'}`
  const used = chunksUsed && chunksUsed !== sources.length ? ` · ${chunksUsed} chunks used` : ''

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
      <CollapsibleTrigger>
        <span className="inline-flex items-center gap-1.5">
          <Quote aria-hidden="true" className="size-3.5 text-fg-muted" />
          {open ? 'Hide sources' : 'Show sources'}
          <span className="text-fg-muted">
            ({count}
            {used})
          </span>
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {sources.map((source) => (
            <li key={`${source.documentId}-${source.chunkIndex}`} className="flex">
              <SourceCard
                source={source}
                filename={names.get(source.documentId)}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
