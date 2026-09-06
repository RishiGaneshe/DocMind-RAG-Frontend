import { create } from 'zustand'
import type { Source } from '@/lib/api'

/**
 * The chat thread.
 *
 * The state transitions are the ones documented in the roadmap — SEND, SOURCES,
 * TOKEN, DONE, ERROR, ABORT, RETRY, CLEAR — written as a reducer so the whole
 * lifecycle of an answer is readable in one place. The reducer is driven through
 * a Zustand store rather than `useReducer` for one reason: the thread survives a
 * trip to `/app/documents/:id` and back, so following a citation does not throw
 * away the answer that cited it.
 *
 * Nothing here is persisted. The backend has no conversation endpoint, so a
 * reload starts a new thread — inventing client-side history would imply a
 * durability the product does not have.
 */

export type MessageRole = 'user' | 'assistant'

/** `streaming` is the only non-terminal status. */
export type MessageStatus = 'streaming' | 'complete' | 'error' | 'aborted'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: number
  status: MessageStatus
  sources?: Source[]
  chunksUsed?: number
  /** Set on assistant messages so Retry can re-ask without the user retyping. */
  query?: string
  /** Human-readable failure, shown in the strip under a kept partial answer. */
  error?: string
}

export interface ChatState {
  messages: ChatMessage[]
  /** The assistant message currently receiving tokens, if any. */
  streamingId: string | null
  /** Seeded by "Ask about this document" and by the suggestion grid. */
  draft: string
  setDraft: (draft: string) => void
  dispatch: (action: ChatAction) => void
}

export type ChatAction =
  | { type: 'SEND'; userId: string; assistantId: string; query: string }
  | { type: 'SOURCES'; id: string; sources: Source[]; chunksUsed: number }
  | { type: 'TOKEN'; id: string; content: string }
  | { type: 'DONE'; id: string }
  | { type: 'ERROR'; id: string; error: string }
  | { type: 'ABORT'; id: string }
  | { type: 'RETRY'; id: string }
  | { type: 'CLEAR' }

interface Core {
  messages: ChatMessage[]
  streamingId: string | null
}

const map = (
  messages: ChatMessage[],
  id: string,
  change: (message: ChatMessage) => ChatMessage,
): ChatMessage[] => messages.map((message) => (message.id === id ? change(message) : message))

export function reducer(state: Core, action: ChatAction): Core {
  switch (action.type) {
    case 'SEND': {
      const now = Date.now()
      return {
        messages: [
          ...state.messages,
          { id: action.userId, role: 'user', content: action.query, createdAt: now, status: 'complete' },
          {
            id: action.assistantId,
            role: 'assistant',
            content: '',
            createdAt: now,
            status: 'streaming',
            query: action.query,
          },
        ],
        streamingId: action.assistantId,
      }
    }

    case 'SOURCES':
      // Sources land before the first token by design (§12.4): the panel can
      // render while the model is still writing.
      return {
        ...state,
        messages: map(state.messages, action.id, (message) => ({
          ...message,
          sources: action.sources,
          chunksUsed: action.chunksUsed,
        })),
      }

    case 'TOKEN':
      return {
        ...state,
        messages: map(state.messages, action.id, (message) => ({
          ...message,
          content: message.content + action.content,
        })),
      }

    case 'DONE':
      return {
        streamingId: state.streamingId === action.id ? null : state.streamingId,
        messages: map(state.messages, action.id, (message) => ({ ...message, status: 'complete' })),
      }

    case 'ERROR':
      // The partial answer is kept on purpose. Replacing it — which the old
      // build did — destroys work the user can still read and act on.
      return {
        streamingId: state.streamingId === action.id ? null : state.streamingId,
        messages: map(state.messages, action.id, (message) => ({
          ...message,
          status: 'error',
          error: action.error,
        })),
      }

    case 'ABORT':
      return {
        streamingId: state.streamingId === action.id ? null : state.streamingId,
        messages: map(state.messages, action.id, (message) => ({ ...message, status: 'aborted' })),
      }

    case 'RETRY':
      return {
        streamingId: action.id,
        messages: map(state.messages, action.id, (message) => ({
          ...message,
          content: '',
          status: 'streaming',
          sources: undefined,
          chunksUsed: undefined,
          error: undefined,
        })),
      }

    case 'CLEAR':
      return { messages: [], streamingId: null }

    default:
      return state
  }
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  streamingId: null,
  draft: '',
  setDraft: (draft) => set({ draft }),
  dispatch: (action) =>
    set((state) => reducer({ messages: state.messages, streamingId: state.streamingId }, action)),
}))

/** Seed the composer from outside the chat page (document detail, suggestions). */
export function seedComposer(text: string): void {
  useChatStore.getState().setDraft(text)
}
