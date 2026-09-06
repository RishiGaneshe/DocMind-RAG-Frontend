import { ArrowDown } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui'
import { usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '../store'
import { MessageBubble } from './MessageBubble'

/**
 * The scrolling thread.
 *
 * Follows the bottom while you are at the bottom and stops the moment you
 * scroll up — being yanked back down while reading an earlier citation is the
 * single most irritating thing a chat UI can do. "Jump to latest" is how you
 * opt back in.
 *
 * This is its own scroll container rather than deferring to the shell's
 * `<main>`, because the composer has to stay put while only the thread moves.
 */

const PINNED_THRESHOLD_PX = 64

interface MessageListProps {
  messages: ChatMessage[]
  streamingId: string | null
  onRetry: (id: string) => void
  className?: string
}

export function MessageList({ messages, streamingId, onRetry, className }: MessageListProps) {
  const scroller = useRef<HTMLDivElement>(null)
  // Which turn the reader scrolled away from, rather than a boolean "pinned".
  // Following is then *derived*: a new turn changes `lastId`, so it re-pins
  // during render instead of through an effect that fires a second pass.
  const [unpinnedFor, setUnpinnedFor] = useState<string | null>(null)
  const reduced = usePrefersReducedMotion()

  const last = messages.at(-1)
  const lastId = last?.id
  const lastLength = last?.content.length ?? 0

  const pinned = lastId === undefined || unpinnedFor !== lastId

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const el = scroller.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  const onScroll = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= PINNED_THRESHOLD_PX
    setUnpinnedFor(atBottom ? null : (lastId ?? null))
  }, [lastId])

  // Token growth: jump, never animate. A smooth scroll retargeted twenty times
  // a second never arrives.
  useEffect(() => {
    if (pinned) scrollToBottom('auto')
  }, [lastLength, pinned, scrollToBottom])

  // A new turn always wins: sending a question re-pins the view (derived above)
  // and this brings the viewport with it.
  useEffect(() => {
    if (!lastId) return
    scrollToBottom(reduced ? 'auto' : 'smooth')
  }, [lastId, reduced, scrollToBottom])

  return (
    <div className={cn('relative min-h-0 flex-1', className)}>
      <div
        ref={scroller}
        onScroll={onScroll}
        // Focusable so the thread can be scrolled with the keyboard without
        // tabbing through every citation inside it. A scrollable region *must*
        // be reachable this way (WCAG 2.1.1), which is exactly the case the
        // no-noninteractive-tabindex rule cannot see.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="log"
        aria-label="Conversation"
        className="h-full overflow-y-auto overscroll-contain px-4 pt-4 pb-2 focus-visible:outline-none sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onRetry={onRetry} />
          ))}
        </div>

        {/* One announcement per turn instead of one per token. */}
        <p role="status" className="sr-only">
          {streamingId ? 'Answering your question.' : messages.length ? 'Answer ready.' : ''}
        </p>
      </div>

      {!pinned && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<ArrowDown />}
            className="pointer-events-auto shadow-md animate-fade-in"
            onClick={() => {
              setUnpinnedFor(null)
              scrollToBottom(reduced ? 'auto' : 'smooth')
            }}
          >
            Jump to latest
          </Button>
        </div>
      )}
    </div>
  )
}
