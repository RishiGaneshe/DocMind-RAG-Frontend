import { FileUp, MessageSquarePlus, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { FadeIn } from '@/components/motion'
import { Button, EmptyState, Skeleton, Tooltip } from '@/components/ui'
import { useDocuments } from '@/features/documents/hooks/useDocuments'
import { Composer } from './Composer'
import { MessageList } from './MessageList'
import { SuggestionGrid } from './SuggestionGrid'
import { useChat } from '../hooks/useChat'

/**
 * The chat surface: thread on top, composer welded to the bottom.
 *
 * The height chain matters more than it looks. This element is
 * `min-h-0 flex-1 flex-col`, the thread is the only `flex-1` child with its own
 * scroll, and the composer is `shrink-0` — so a two-line question grows the box
 * upward instead of pushing the send button off the viewport, and no
 * `position: fixed` is involved anywhere.
 */
export function ChatPanel() {
  const { messages, streamingId, isStreaming, draft, setDraft, send, stop, retry, clear, ready } =
    useChat()
  const { documents, isInitialLoading } = useDocuments()

  const hasThread = messages.length > 0
  const noDocuments = !isInitialLoading && documents.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {hasThread ? (
        <>
          <div className="flex shrink-0 items-center justify-end px-4 pt-3 sm:px-6">
            <Tooltip content="Clears this conversation. Your documents are untouched.">
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<MessageSquarePlus />}
                onClick={clear}
                disabled={isStreaming}
              >
                New thread
              </Button>
            </Tooltip>
          </div>

          <MessageList messages={messages} streamingId={streamingId} onRetry={retry} />
        </>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-8 sm:px-6">
          <FadeIn className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-xl border border-accent/25 bg-accent-wash text-accent"
            >
              <Sparkles className="size-6" />
            </span>

            <div className="flex flex-col gap-2">
              <h1 className="font-display text-2xl font-semibold text-fg text-balance sm:text-3xl">
                Ask your documents anything
              </h1>
              <p className="mx-auto max-w-md text-sm text-fg-muted text-pretty">
                Every answer is drawn from the PDFs in this workspace and cites the passages it
                used, so you can check the source rather than trust the summary.
              </p>
            </div>

            {isInitialLoading ? (
              <div className="grid w-full gap-2 sm:grid-cols-2">
                {[0, 1, 2, 3].map((index) => (
                  <Skeleton key={index} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : noDocuments ? (
              <EmptyState
                size="sm"
                className="w-full"
                icon={<FileUp />}
                title="No documents yet"
                description="Answers can only come from what you upload. Add a PDF and the first question will have something to work with."
                secondaryAction={
                  <Button asChild>
                    <Link to="/app/documents/upload">Upload a PDF</Link>
                  </Button>
                }
              />
            ) : (
              <SuggestionGrid documents={documents} onPick={setDraft} />
            )}
          </FadeIn>
        </div>
      )}

      <Composer
        value={draft}
        onChange={setDraft}
        onSubmit={send}
        onStop={stop}
        isStreaming={isStreaming}
        ready={ready}
        autoFocus={!hasThread}
      />
    </div>
  )
}
