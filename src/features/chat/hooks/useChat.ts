import { useCallback, useEffect } from 'react'
import { ApiError, ask, isAbortError, streamQuery } from '@/lib/api'
import { useTenantId } from '@/stores/sessionStore'
import { useUiStore } from '@/stores/uiStore'
import { useChatStore } from '../store'

/**
 * Asking a question, and everything that can happen next.
 *
 * The moving parts deliberately live at module scope rather than in refs:
 * following a citation unmounts the chat page, and an answer must keep arriving
 * while the user reads the document it came from. A ref-based controller would
 * be dropped on that unmount and Stop would stop working on return.
 *
 * Tokens are coalesced. The backend emits one SSE frame per model token, and
 * dispatching each one would re-render the whole thread dozens of times a
 * second; instead they accumulate for ~50 ms and land inside a frame the
 * browser was going to paint anyway.
 */

const FLUSH_MS = 50

let controller: AbortController | null = null

const pending = {
  text: '',
  timer: null as ReturnType<typeof setTimeout> | null,
  frame: null as number | null,
}

let counter = 0

function makeId(prefix: string): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`
}

function flush(id: string): void {
  if (pending.timer !== null) {
    clearTimeout(pending.timer)
    pending.timer = null
  }
  if (pending.frame !== null) {
    cancelAnimationFrame(pending.frame)
    pending.frame = null
  }
  const content = pending.text
  pending.text = ''
  if (content) useChatStore.getState().dispatch({ type: 'TOKEN', id, content })
}

function enqueue(id: string, content: string): void {
  pending.text += content
  if (pending.timer !== null) return
  pending.timer = setTimeout(() => {
    pending.timer = null
    pending.frame = requestAnimationFrame(() => {
      pending.frame = null
      flush(id)
    })
  }, FLUSH_MS)
}

/** Backend errors already read as sentences; anything else gets a fallback. */
function describe(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return 'Could not reach the server. Check your connection and try again.'
    }
    return error.message
  }
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong while answering. Try again.'
}

/**
 * Runs one turn against the API and reports it through the reducer. Never
 * throws: every outcome is a dispatched action, which is what keeps the UI a
 * pure function of thread state.
 */
async function run(tenantId: string, assistantId: string, query: string): Promise<void> {
  const { dispatch } = useChatStore.getState()
  const { topK, streaming } = useUiStore.getState()

  controller = new AbortController()
  const { signal } = controller

  try {
    if (streaming) {
      await streamQuery(
        tenantId,
        { query, topK, signal },
        {
          onSources: ({ sources, chunksUsed }) =>
            dispatch({ type: 'SOURCES', id: assistantId, sources, chunksUsed }),
          onToken: (content) => enqueue(assistantId, content),
        },
      )
      flush(assistantId)
      dispatch({ type: 'DONE', id: assistantId })
    } else {
      const result = await ask(tenantId, { query, topK, signal })
      dispatch({
        type: 'SOURCES',
        id: assistantId,
        sources: result.sources,
        chunksUsed: result.chunksUsed ?? result.sources.length,
      })
      dispatch({ type: 'TOKEN', id: assistantId, content: result.answer })
      dispatch({ type: 'DONE', id: assistantId })
    }
  } catch (error) {
    // Whatever arrived before the failure stays on screen (§12.4).
    flush(assistantId)
    if (isAbortError(error)) dispatch({ type: 'ABORT', id: assistantId })
    else dispatch({ type: 'ERROR', id: assistantId, error: describe(error) })
  } finally {
    controller = null
  }
}

export function useChat() {
  const messages = useChatStore((s) => s.messages)
  const streamingId = useChatStore((s) => s.streamingId)
  const draft = useChatStore((s) => s.draft)
  const setDraft = useChatStore((s) => s.setDraft)
  const dispatch = useChatStore((s) => s.dispatch)
  const tenantId = useTenantId()

  // Only the timers are torn down with the page — not the request. See above.
  useEffect(
    () => () => {
      if (pending.timer !== null) clearTimeout(pending.timer)
      if (pending.frame !== null) cancelAnimationFrame(pending.frame)
      pending.timer = null
      pending.frame = null
    },
    [],
  )

  const send = useCallback(
    (raw: string) => {
      const query = raw.trim()
      if (!query || !tenantId || useChatStore.getState().streamingId) return

      const assistantId = makeId('a')
      dispatch({ type: 'SEND', userId: makeId('u'), assistantId, query })
      setDraft('')
      void run(tenantId, assistantId, query)
    },
    [dispatch, setDraft, tenantId],
  )

  const stop = useCallback(() => {
    controller?.abort()
  }, [])

  const retry = useCallback(
    (id: string) => {
      const message = useChatStore.getState().messages.find((m) => m.id === id)
      if (!message?.query || !tenantId || useChatStore.getState().streamingId) return
      dispatch({ type: 'RETRY', id })
      void run(tenantId, id, message.query)
    },
    [dispatch, tenantId],
  )

  const clear = useCallback(() => {
    controller?.abort()
    pending.text = ''
    dispatch({ type: 'CLEAR' })
  }, [dispatch])

  return {
    messages,
    streamingId,
    isStreaming: streamingId !== null,
    draft,
    setDraft,
    send,
    stop,
    retry,
    clear,
    /** False before a workspace exists — the composer explains why. */
    ready: Boolean(tenantId),
  }
}
