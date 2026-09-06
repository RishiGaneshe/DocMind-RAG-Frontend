import { Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import type { DocumentRecord } from '@/lib/api'
import { stripExtension, truncate } from '@/lib/utils'

/**
 * Starter questions, built from the workspace's actual filenames.
 *
 * Invented examples ("What is our refund policy?") teach the wrong thing when
 * the answer can only come from what has been uploaded. Naming real documents
 * makes the grounding rule obvious before the first question is even asked.
 *
 * Picking one fills the composer instead of sending: the suggestion is a
 * starting point to edit, not a command.
 */

function buildSuggestions(documents: DocumentRecord[]): string[] {
  const ready = documents.filter((doc) => doc.status === 'COMPLETED')
  const names = ready.map((doc) => truncate(stripExtension(doc.filename), 42))
  const out: string[] = []

  if (names[0]) out.push(`Summarise ${names[0]} in a few bullet points`)
  if (names[0]) out.push(`What are the key findings in ${names[0]}?`)
  if (names[1]) out.push(`Compare ${names[0]} and ${names[1]}`)
  out.push('What topics do my documents cover?')
  if (names.length > 1) out.push('Which document should I read first, and why?')

  return [...new Set(out)].slice(0, 4)
}

interface SuggestionGridProps {
  documents: DocumentRecord[]
  onPick: (question: string) => void
}

export function SuggestionGrid({ documents, onPick }: SuggestionGridProps) {
  const suggestions = useMemo(() => buildSuggestions(documents), [documents])

  return (
    <ul className="grid w-full gap-2 sm:grid-cols-2">
      {suggestions.map((question) => (
        <li key={question} className="flex">
          <button
            type="button"
            onClick={() => onPick(question)}
            className="group flex w-full min-h-11 items-start gap-2.5 rounded-lg border border-line bg-surface p-3 text-left text-sm text-fg-secondary transition-colors duration-(--dur-fast) hover:border-accent/40 hover:bg-accent-wash/40 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
          >
            <Sparkles
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-fg-muted transition-colors group-hover:text-accent"
            />
            <span>{question}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
