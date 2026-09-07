import { describe, expect, it } from 'vitest'
import { buildHistory } from './useChat'
import type { ChatMessage } from '../store'

describe('buildHistory', () => {
  it('takes at most the last 6 turns', () => {
    const messages: ChatMessage[] = Array.from({ length: 10 }, (_, i) => ({
      id: `msg_${i}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
      status: 'complete',
      createdAt: Date.now(),
      sources: [],
    }))

    const history = buildHistory(messages, 'current_assistant')
    expect(history.length).toBe(6)
    expect(history[0].content).toBe('Message 4')
    expect(history[5].content).toBe('Message 9')
  })

  it('truncates turns longer than 1000 characters', () => {
    const longText = 'x'.repeat(1500)
    const messages: ChatMessage[] = [
      {
        id: 'msg_1',
        role: 'user',
        content: longText,
        status: 'complete',
        createdAt: Date.now(),
        sources: [],
      },
    ]

    const history = buildHistory(messages, 'current_assistant')
    expect(history.length).toBe(1)
    expect(history[0].content.length).toBe(1000)
  })

  it('excludes the current pending assistant message and incomplete/empty messages', () => {
    const messages: ChatMessage[] = [
      {
        id: 'msg_1',
        role: 'user',
        content: 'Valid user question',
        status: 'complete',
        createdAt: Date.now(),
        sources: [],
      },
      {
        id: 'msg_2',
        role: 'assistant',
        content: '   ',
        status: 'complete',
        createdAt: Date.now(),
        sources: [],
      },
      {
        id: 'active_assistant_id',
        role: 'assistant',
        content: 'Streaming answer in flight',
        status: 'streaming',
        createdAt: Date.now(),
        sources: [],
      },
    ]

    const history = buildHistory(messages, 'active_assistant_id')
    expect(history.length).toBe(1)
    expect(history[0].content).toBe('Valid user question')
  })
})
