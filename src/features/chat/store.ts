import { create } from 'zustand'
import type { Source } from '@/lib/api'

export type MessageRole = 'user' | 'assistant'
export type MessageStatus = 'streaming' | 'complete' | 'error' | 'aborted'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: number
  status: MessageStatus
  sources?: Source[]
  chunksUsed?: number
  query?: string
  error?: string
}

export interface ChatState {
  messages: ChatMessage[]
  streamingId: string | null
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

export function seedComposer(text: string): void {
  useChatStore.getState().setDraft(text)
}
