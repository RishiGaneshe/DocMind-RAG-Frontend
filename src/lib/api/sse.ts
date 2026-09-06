import { API_BASE_URL } from '../constants'
import { tokenStorage } from '../tokenStorage'
import { ApiError, expireSession, refreshTokens, toApiError } from './client'
import { sseChunkSchema, sseErrorSchema, sseSourcesSchema, type Source } from './types'

/**
 * Server-sent events over `fetch`, by hand.
 *
 * `EventSource` cannot do either of the two things this endpoint needs: send a
 * POST body, or attach an Authorization header. So the stream is read off
 * `response.body` and the frames are parsed here. The backend writes
 * `event: <name>\ndata: <json>\n\n` (src/api/query.js), which is a small,
 * well-defined subset of the SSE grammar.
 */

export interface StreamCallbacks {
  /** Fired once, before the first token — the sources panel renders early. */
  onSources?: (payload: { sources: Source[]; query: string; chunksUsed: number }) => void
  onToken: (content: string) => void
  /** The backend sent `event: done`. Absent if the stream died mid-answer. */
  onDone?: () => void
}

export interface StreamInput {
  query: string
  topK?: number
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

  return fetch(`${API_BASE_URL}/tenants/${tenantId}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: input.query,
      stream: true,
      ...(input.topK === undefined ? {} : { topK: input.topK }),
    }),
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

/** `event:`/`data:` pairs, one frame per blank-line-separated block. */
function parseFrame(raw: string): { event: string; data: string } | null {
  let event = 'message'
  const dataLines: string[] = []

  for (const line of raw.split('\n')) {
    const clean = line.endsWith('\r') ? line.slice(0, -1) : line
    if (!clean || clean.startsWith(':')) continue
    const colon = clean.indexOf(':')
    const field = colon === -1 ? clean : clean.slice(0, colon)
    // A single leading space after the colon is part of the framing, not data.
    let value = colon === -1 ? '' : clean.slice(colon + 1)
    if (value.startsWith(' ')) value = value.slice(1)

    if (field === 'event') event = value
    else if (field === 'data') dataLines.push(value)
  }

  if (!dataLines.length) return null
  return { event, data: dataLines.join('\n') }
}

/**
 * Consumes the stream, calling back per frame. Resolves when the stream ends.
 *
 * Throws `ApiError` on a transport or backend failure and rethrows the
 * `AbortError` when the caller stops generation — in both cases the tokens
 * already delivered through `onToken` stay on screen, which is what makes the
 * "partial answer + Retry" state possible (§12.4).
 */
export async function streamQuery(
  tenantId: string,
  input: StreamInput,
  callbacks: StreamCallbacks,
): Promise<void> {
  let response = await openStream(tenantId, input, tokenStorage.getAccessToken())

  if (response.status === 401) {
    const payload = await response.json().catch(() => null)
    const error = toApiError(401, payload)
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
    throw toApiError(response.status, payload)
  }

  if (!response.body) {
    throw new ApiError('This browser cannot read streaming responses.', 0, 'NO_STREAM')
  }

  const body = response.body
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  // A holder, not a plain `let`: the assignment happens inside `handle`, and
  // narrowing a captured `let` across a closure boundary is not something the
  // compiler can follow.
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

      // Frames are separated by a blank line; anything after the last one is a
      // partial frame and stays in the buffer until the next read.
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
    // Stop the server generating tokens nobody will read.
    if (!input.signal?.aborted) await body.cancel().catch(() => undefined)
  }

  if (failure.error) throw failure.error
}
