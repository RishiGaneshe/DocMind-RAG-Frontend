import { describe, expect, it, vi } from 'vitest'
import { publicChatResponseSchema, publicSourceSchema } from './types'
import { streamPublicChat } from './sse'

describe('publicSourceSchema and publicChatResponseSchema', () => {
  it('parses labels mode redacted sources with only citation, filename, and page', () => {
    const payload = {
      citation: 1,
      filename: 'handbook.pdf',
      page: 4,
    }
    const result = publicSourceSchema.safeParse(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.citation).toBe(1)
      expect(result.data.filename).toBe('handbook.pdf')
      expect(result.data.page).toBe(4)
      expect(result.data.documentId).toBeUndefined()
      expect(result.data.snippet).toBeUndefined()
    }
  })

  it('parses full mode sources with snippets and scores', () => {
    const payload = {
      citation: 2,
      filename: 'architecture.pdf',
      page: 12,
      documentId: 'd3b07384-d113-4672-8874-a09c25f46401',
      chunkIndex: 3,
      breadcrumb: 'System Architecture > Retrieval',
      relevanceScore: 0.92,
      snippet: 'Vectors are queried using cosine similarity.',
    }
    const result = publicSourceSchema.safeParse(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.citation).toBe(2)
      expect(result.data.snippet).toBe('Vectors are queried using cosine similarity.')
    }
  })

  it('parses complete public chat response with redacted sources and citedSources', () => {
    const response = {
      success: true,
      answer: 'The refund window is 30 days from delivery [1].',
      sources: [{ citation: 1, filename: 'policy.pdf', page: 2 }],
      citedSources: [1],
      chunksUsed: 3,
    }
    const result = publicChatResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('parses no-context response with empty sources array', () => {
    const response = {
      success: true,
      answer: 'I could not find any relevant information in the uploaded documents to answer your question.',
      sources: [],
      citedSources: [],
      chunksUsed: 0,
    }
    const result = publicChatResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })
})

describe('streamPublicChat', () => {
  it('streams tokens and processes sources event and done event', async () => {
    const sseBody = [
      'event: sources\n',
      'data: {"sources":[{"citation":1,"filename":"doc.pdf","page":1}],"chunksUsed":2}\n\n',
      'event: chunk\n',
      'data: {"content":"Hello "}\n\n',
      'event: chunk\n',
      'data: {"content":"world!"}\n\n',
      'event: done\n',
      'data: {"success":true}\n\n',
    ].join('')

    const mockResponse = new Response(sseBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'RateLimit-Remaining': '29',
        'X-Quota-Remaining': '499',
      },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse)

    const onToken = vi.fn()
    const onSources = vi.fn()
    const onDone = vi.fn()
    const onLimits = vi.fn()

    await streamPublicChat(
      'pk_live_test123',
      { query: 'test question' },
      { onToken, onSources, onDone, onLimits },
    )

    expect(onSources).toHaveBeenCalledWith({
      sources: [{ citation: 1, filename: 'doc.pdf', page: 1 }],
      chunksUsed: 2,
    })
    expect(onToken).toHaveBeenCalledWith('Hello ')
    expect(onToken).toHaveBeenCalledWith('world!')
    expect(onDone).toHaveBeenCalled()
    expect(onLimits).toHaveBeenCalledWith({
      rateLimitRemaining: 29,
      quotaRemaining: 499,
      retryAfter: null,
    })

    vi.restoreAllMocks()
  })
})
