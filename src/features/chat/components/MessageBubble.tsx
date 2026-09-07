import { Check, Copy, FileSearch, RotateCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { Alert, Button, Pill } from '@/components/ui'
import { useCopyToClipboard } from '@/hooks'
import { NO_CONTEXT_ANSWER } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '../store'
import { Markdown } from './Markdown'
import { SourcesDisclosure } from './SourcesDisclosure'
import { StreamingCursor, TypingIndicator } from './StreamingIndicator'

function clockTime(createdAt: number): string {
  return new Date(createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function Timestamp({ at, className }: { at: number; className?: string }) {
  return (
    <time
      dateTime={new Date(at).toISOString()}
      className={cn('text-xs text-fg-disabled tabular-nums', className)}
    >
      {clockTime(at)}
    </time>
  )
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={cn(
          'max-w-[85%] rounded-2xl rounded-br-sm border border-accent/25 bg-accent-wash px-3.5 py-2.5',
          'text-sm leading-relaxed whitespace-pre-wrap text-fg wrap-anywhere',
        )}
      >
        {message.content}
      </div>
      <Timestamp at={message.createdAt} className="pr-1" />
    </div>
  )
}

function AssistantMessage({
  message,
  onRetry,
}: {
  message: ChatMessage
  onRetry: (id: string) => void
}) {
  const { copy, copied } = useCopyToClipboard()
  const streaming = message.status === 'streaming'
  const hasText = message.content.trim().length > 0
  const noContext = !streaming && message.content.trim().startsWith(NO_CONTEXT_ANSWER)

  return (
    <article aria-busy={streaming || undefined} className="group flex flex-col">
      <header className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-wash text-accent"
        >
          <Sparkles className="size-3.5" />
        </span>
        <span className="text-xs font-semibold tracking-wide text-fg-secondary">DocMind</span>
        <Timestamp at={message.createdAt} />
      </header>

      <div className="mt-1.5 pl-8">
        {streaming && !hasText && (
          <p className="flex items-center gap-2 text-sm text-fg-muted">
            <TypingIndicator />
            {message.sources ? 'Writing the answer…' : 'Searching your documents…'}
          </p>
        )}

        {noContext ? (
          <Alert
            tone="info"
            icon={<FileSearch className="size-4" />}
            title="Nothing in your documents matched"
          >
            <p>
              The answer is only ever drawn from what you have uploaded, so this question was left
              unanswered rather than guessed at. Try rephrasing it, or add the document that covers
              it.
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-2">
              <Link to="/app/documents/upload">Upload a document</Link>
            </Button>
          </Alert>
        ) : (
          hasText && (
            <div className="max-w-(--prose-max)">
              <Markdown content={message.content} />
              {streaming && <StreamingCursor />}
            </div>
          )
        )}

        {message.sources && !noContext && (
          <SourcesDisclosure sources={message.sources} chunksUsed={message.chunksUsed} />
        )}

        {message.status === 'error' && (
          <Alert
            tone="error"
            className="mt-3"
            title={hasText ? 'The answer stopped early' : 'That question could not be answered'}
            action={
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<RotateCcw />}
                onClick={() => onRetry(message.id)}
              >
                Retry
              </Button>
            }
          >
            {message.error}
          </Alert>
        )}

        {message.status === 'aborted' && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill tone="neutral" size="sm">
              Stopped
            </Pill>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<RotateCcw />}
              onClick={() => onRetry(message.id)}
            >
              Try again
            </Button>
          </div>
        )}

        {!streaming && hasText && !noContext && (
          <div className="mt-1 -ml-2 flex items-center gap-1 opacity-0 transition-opacity duration-(--dur-fast) focus-within:opacity-100 group-hover:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={copied ? <Check /> : <Copy />}
              onClick={() => void copy(message.content)}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}

export function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage
  onRetry: (id: string) => void
}) {
  return message.role === 'user' ? (
    <UserMessage message={message} />
  ) : (
    <AssistantMessage message={message} onRetry={onRetry} />
  )
}
