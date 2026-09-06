import { Check, Copy } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { IconButton } from '@/components/ui'
import { useCopyToClipboard } from '@/hooks'
import { cn } from '@/lib/utils'

/**
 * Model output, rendered.
 *
 * `rehype-sanitize` runs on every answer. The model is quoting user-uploaded
 * PDFs, so its output is untrusted input by definition — raw HTML in an answer
 * must never reach the DOM. The default GitHub schema also keeps
 * `language-*` classes, which is all the syntax hinting this needs.
 *
 * Element styling is explicit rather than a typography plugin: the palette is
 * token-driven, and a plugin's own colour opinions would fight the theme.
 */

/** Walks a hast node for its text, so Copy gets the source, not the DOM. */
function nodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const current = node as { type?: string; value?: string; children?: unknown[] }
  if (current.type === 'text') return current.value ?? ''
  return (current.children ?? []).map(nodeText).join('')
}

function CodeBlock({ node, children }: { node?: unknown; children?: React.ReactNode }) {
  const { copy, copied } = useCopyToClipboard()
  const source = nodeText(node)

  return (
    <div className="group relative my-3">
      {/* Overflow scrolls horizontally on purpose: wrapping code changes what
          it means, and a phone cannot show 80 columns. */}
      <pre className="overflow-x-auto rounded-lg border border-line bg-bg-base p-3 text-[13px] leading-relaxed">
        {children}
      </pre>
      {source && (
        <div className="absolute top-1.5 right-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <IconButton
            label={copied ? 'Copied' : 'Copy code'}
            icon={copied ? <Check /> : <Copy />}
            size="sm"
            variant="secondary"
            onClick={() => void copy(source)}
          />
        </div>
      )}
    </div>
  )
}

const components: Components = {
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="rounded text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
    >
      {children}
    </a>
  ),

  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5 marker:text-fg-muted">{children}</li>,

  h1: ({ children }) => <h3 className="mt-4 mb-2 text-base font-semibold text-fg">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-4 mb-2 text-base font-semibold text-fg">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-3 mb-1.5 text-sm font-semibold text-fg">{children}</h4>,
  h4: ({ children }) => <h5 className="mt-3 mb-1.5 text-sm font-semibold text-fg">{children}</h5>,

  strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,

  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-accent/40 pl-3 text-fg-secondary italic">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="my-4 border-line" />,

  pre: ({ node, children }) => <CodeBlock node={node}>{children}</CodeBlock>,

  code: ({ className, children }) => {
    // A fenced block keeps its language class; inline code gets the pill.
    if (className?.includes('language-')) {
      return <code className={cn('font-mono', className)}>{children}</code>
    }
    return (
      <code className="rounded border border-line bg-surface-raised px-1 py-0.5 font-mono text-[0.9em] text-fg">
        {children}
      </code>
    )
  },

  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-raised">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-line px-3 py-2 font-semibold text-fg">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-line px-3 py-2 text-fg-secondary last:border-0">{children}</td>
  ),
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn('text-sm leading-relaxed text-fg-secondary', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
