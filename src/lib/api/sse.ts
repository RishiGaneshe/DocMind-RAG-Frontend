import { API_BASE_URL } from '../constants'
import { tokenStorage } from '../tokenStorage'
import { ApiError, expireSession, refreshTokens, toApiError } from './client'
import {
  publicSseSourcesSchema,
  sseChunkSchema,
  sseErrorSchema,
  sseSourcesSchema,
  type PublicSource,
  type Source,
} from './types'

export interface StreamCallbacks {
  onSources?: (payload: {
    sources: Source[]
    query?: string
    searchQuery?: string
    rewritten?: boolean
    chunksUsed: number
  }) => void
  onToken: (content: string) => void
  onDone?: () => void
  onIncomplete?: () => void
}

export interface StreamInput {
  query: string
  topK?: number
  documentIds?: string[]
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  signal?: AbortSignal
}

function openStream(
  tenantId: string,
  input: StreamInput,
  token: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const body: Record<string, unknown> = {
    query: input.query,
    stream: true,
  }
  if (input.topK !== undefined) body.topK = input.topK
  if (input.documentIds && input.documentIds.length > 0) body.documentIds = input.documentIds
  if (input.history && input.history.length > 0) body.history = input.history

  return fetch(`${API_BASE_URL}/tenants/${tenantId}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: input.signal,
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(
      'Could not reach the answering service. Check your connection and try again.',
      0,
      'NETWORK',
      error,
    )
  })
}

function parseFrame(raw: string): { event: string; data: string } | null {
  let event = 'message'
  const dataLines: string[] = []

  for (const line of raw.split('\n')) {
    const clean = line.endsWith('\r') ? line.slice(0, -1) : line
    if (!clean || clean.startsWith(':')) continue
    const colon = clean.indexOf(':')
    const field = colon === -1 ? clean : clean.slice(0, colon)
    let value = colon === -1 ? '' : clean.slice(colon + 1)
    if (value.startsWith(' ')) value = value.slice(1)

    if (field === 'event') event = value
    else if (field === 'data') dataLines.push(value)
  }

  if (!dataLines.length) return null
  return { event, data: dataLines.join('\n') }
}

export async function streamQuery(
  tenantId: string,
  input: StreamInput,
  callbacks: StreamCallbacks,
): Promise<void> {
  let response = await openStream(tenantId, input, tokenStorage.getAccessToken())

  if (response.status === 401) {
    const payload = await response.json().catch(() => null)
    const error = toApiError(401, payload, response.headers)
    if (error.code === 'TOKEN_REVOKED' || !tokenStorage.getRefreshToken()) {
      expireSession()
      throw error
    }
    try {
      const { accessToken } = await refreshTokens()
      response = await openStream(tenantId, input, accessToken)
    } catch {
      expireSession()
      throw error
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw toApiError(response.status, payload, response.headers)
  }

  if (!response.body) {
    throw new ApiError('This browser cannot read streaming responses.', 0, 'NO_STREAM')
  }

  const body = response.body
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finished = false
  const failure: { error: ApiError | null } = { error: null }

  const handle = (frame: { event: string; data: string }): void => {
    let json: unknown
    try {
      json = JSON.parse(frame.data)
    } catch {
      return // A malformed frame is not worth failing the whole answer over.
    }

    switch (frame.event) {
      case 'sources': {
        const parsed = sseSourcesSchema.safeParse(json)
        if (parsed.success) {
          callbacks.onSources?.({
            sources: parsed.data.sources,
            query: parsed.data.query,
            searchQuery: parsed.data.searchQuery,
            rewritten: parsed.data.rewritten,
            chunksUsed: parsed.data.chunksUsed ?? 0,
          })
        }
        return
      }
      case 'chunk': {
        const parsed = sseChunkSchema.safeParse(json)
        if (parsed.success && parsed.data.content) callbacks.onToken(parsed.data.content)
        return
      }
      case 'done': {
        finished = true
        callbacks.onDone?.()
        return
      }
      case 'error': {
        const parsed = sseErrorSchema.safeParse(json)
        failure.error = new ApiError(
          parsed.success ? parsed.data.error : 'The answer could not be completed.',
          502,
          'STREAM',
        )
        return
      }
      default:
        return
    }
  }

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      let boundary = buffer.indexOf('\n\n')
      while (boundary !== -1) {
        const raw = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)
        const frame = parseFrame(raw)
        if (frame) handle(frame)
        boundary = buffer.indexOf('\n\n')
      }

      if (failure.error) break
    }

    const tail = parseFrame(buffer)
    if (tail && !failure.error) handle(tail)
  } finally {
    reader.releaseLock()
    if (!input.signal?.aborted) await body.cancel().catch(() => undefined)
  }

  if (failure.error) throw failure.error
  if (!finished && !input.signal?.aborted) {
    callbacks.onIncomplete?.()
  }
}

export interface PublicStreamCallbacks {
  onSources?: (payload: { sources: PublicSource[]; chunksUsed: number }) => void
  onToken: (content: string) => void
  onDone?: () => void
  onIncomplete?: () => void
  onLimits?: (limits: {
    rateLimitRemaining: number | null
    quotaRemaining: number | null
    retryAfter: number | null
  }) => void
}

export interface PublicStreamInput {
  query: string
  sessionId?: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  documentIds?: string[]
  signal?: AbortSignal
}

export async function streamPublicChat(
  apiKey: string,
  input: PublicStreamInput,
  callbacks: PublicStreamCallbacks,
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    'X-Api-Key': apiKey,
  }

  const body: Record<string, unknown> = {
    query: input.query,
    stream: true,
  }
  if (input.sessionId) body.sessionId = input.sessionId
  if (input.history && input.history.length > 0) body.history = input.history
  if (input.documentIds && input.documentIds.length > 0) body.documentIds = input.documentIds

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/public/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: input.signal,
    })
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(
      'Could not reach the answering service. Check your connection and try again.',
      0,
      'NETWORK',
      error,
    )
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw toApiError(response.status, payload, response.headers)
  }

  callbacks.onLimits?.({
    rateLimitRemaining: response.headers.get('RateLimit-Remaining')
      ? Number(response.headers.get('RateLimit-Remaining'))
      : null,
    quotaRemaining: response.headers.get('X-Quota-Remaining')
      ? Number(response.headers.get('X-Quota-Remaining'))
      : null,
    retryAfter: response.headers.get('Retry-After')
      ? Number(response.headers.get('Retry-After'))
      : null,
  })

  if (!response.body) {
    throw new ApiError('This browser cannot read streaming responses.', 0, 'NO_STREAM')
  }

  const bodyStream = response.body
  const reader = bodyStream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finished = false
  const failure: { error: ApiError | null } = { error: null }

  const handle = (frame: { event: string; data: string }): void => {
    let json: unknown
    try {
      json = JSON.parse(frame.data)
    } catch {
      return
    }

    switch (frame.event) {
      case 'sources': {
        const parsed = publicSseSourcesSchema.safeParse(json)
        if (parsed.success) {
          callbacks.onSources?.({
            sources: parsed.data.sources,
            chunksUsed: parsed.data.chunksUsed ?? 0,
          })
        }
        return
      }
      case 'chunk': {
        const parsed = sseChunkSchema.safeParse(json)
        if (parsed.success && parsed.data.content) callbacks.onToken(parsed.data.content)
        return
      }
      case 'done': {
        finished = true
        callbacks.onDone?.()
        return
      }
      case 'error': {
        const parsed = sseErrorSchema.safeParse(json)
        failure.error = new ApiError(
          parsed.success ? parsed.data.error : 'The answer could not be completed.',
          502,
          'STREAM',
        )
        return
      }
      default:
        return
    }
  }

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      let boundary = buffer.indexOf('\n\n')
      while (boundary !== -1) {
        const raw = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)
        const frame = parseFrame(raw)
        if (frame) handle(frame)
        boundary = buffer.indexOf('\n\n')
      }

      if (failure.error) break
    }

    const tail = parseFrame(buffer)
    if (tail && !failure.error) handle(tail)
  } finally {
    reader.releaseLock()
    if (!input.signal?.aborted) await bodyStream.cancel().catch(() => undefined)
  }

  if (failure.error) throw failure.error
  if (!finished && !input.signal?.aborted) {
    callbacks.onIncomplete?.()
  }
}
