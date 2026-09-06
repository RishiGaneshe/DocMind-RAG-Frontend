import { API_BASE_URL } from '../constants'
import { tokenStorage, type TokenPair } from '../tokenStorage'
import { errorResponseSchema, refreshResponseSchema } from './types'
import type { z } from 'zod'

/**
 * The one place that speaks HTTP.
 *
 * Components never call `fetch`. They call a hook, the hook calls an endpoint
 * function, and the endpoint function calls through here — so the Authorization
 * header, the refresh dance, and error normalisation exist exactly once.
 */

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** No response at all — offline, DNS failure, server down. */
  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isTenantRequired(): boolean {
    return this.status === 403 && this.code === 'TENANT_REQUIRED'
  }

  get isTenantMismatch(): boolean {
    return this.status === 403 && this.code === 'TENANT_MISMATCH'
  }
}

/**
 * Called when the session cannot be recovered — a revoked token, or a refresh
 * that failed. sessionStore subscribes and raises SessionExpiredDialog, so a
 * long chat is never discarded by a background 401 (§11.1).
 */
type SessionExpiredHandler = () => void
let onSessionExpired: SessionExpiredHandler | null = null

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  onSessionExpired = handler
}

function expireSession(): void {
  tokenStorage.clear()
  onSessionExpired?.()
}

/* --- Single-flight refresh ------------------------------------------------ */

let inFlightRefresh: Promise<TokenPair> | null = null

async function performRefresh(): Promise<TokenPair> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) throw new ApiError('No refresh token available', 401)

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  const payload = await readBody(response)
  if (!response.ok) throw toApiError(response.status, payload)

  const parsed = refreshResponseSchema.safeParse(payload)
  if (!parsed.success) throw new ApiError('Malformed refresh response', 500, 'RESPONSE_SHAPE')

  const pair = { accessToken: parsed.data.accessToken, refreshToken: parsed.data.refreshToken }
  // Keep the caller's original "remember me" choice.
  tokenStorage.set(pair)
  return pair
}

/**
 * Concurrent 401s share one refresh request. Without this, ten parallel
 * requests would fire ten refreshes, and the backend rotates the refresh token
 * on use — nine of them would fail and log the user out.
 */
function refreshTokens(): Promise<TokenPair> {
  inFlightRefresh ??= performRefresh().finally(() => {
    inFlightRefresh = null
  })
  return inFlightRefresh
}

/* --- Response handling --------------------------------------------------- */

async function readBody(response: Response): Promise<unknown> {
  const type = response.headers.get('content-type') ?? ''
  if (response.status === 204) return null
  if (type.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }
  const text = await response.text()
  return text || null
}

const STATUS_FALLBACKS: Record<number, string> = {
  400: 'The request was rejected. Please check the details and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have access to this workspace.',
  404: 'Not found.',
  409: 'That already exists.',
  413: 'That file is too large.',
  429: 'Too many requests. Please wait a moment.',
  500: 'Something went wrong on the server.',
  502: 'The answering service is unavailable right now.',
  503: 'The service is temporarily unavailable.',
}

function toApiError(status: number, payload: unknown): ApiError {
  const parsed = errorResponseSchema.safeParse(payload)
  const message =
    (parsed.success ? parsed.data.error : undefined) ??
    (typeof payload === 'string' && payload.trim() ? payload.trim() : undefined) ??
    STATUS_FALLBACKS[status] ??
    'Request failed.'
  return new ApiError(message, status, parsed.success ? parsed.data.code : undefined, payload)
}

export interface RequestOptions<TSchema extends z.ZodType> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Validates the response. Omit only for endpoints with no useful body. */
  schema?: TSchema
  signal?: AbortSignal
  /** Skip the Authorization header and the refresh retry (login, signup). */
  anonymous?: boolean
  headers?: Record<string, string>
}

export async function apiRequest<TSchema extends z.ZodType>(
  path: string,
  options: RequestOptions<TSchema> = {},
): Promise<z.infer<TSchema>> {
  const { method = 'GET', body, schema, signal, anonymous = false, headers = {} } = options

  const send = async (token: string | null): Promise<Response> => {
    const requestHeaders: Record<string, string> = { ...headers }
    if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'
    if (token) requestHeaders.Authorization = `Bearer ${token}`

    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      throw new ApiError(
        'Could not reach the server. Check your connection and try again.',
        0,
        'NETWORK',
        error,
      )
    }
  }

  let response = await send(anonymous ? null : tokenStorage.getAccessToken())

  // One silent refresh + replay. `anonymous` requests never retry: a 401 from
  // /auth/login means bad credentials, not a stale token.
  if (response.status === 401 && !anonymous) {
    const payload = await readBody(response)
    const error = toApiError(401, payload)

    if (error.code === 'TOKEN_REVOKED' || !tokenStorage.getRefreshToken()) {
      expireSession()
      throw error
    }

    try {
      const { accessToken } = await refreshTokens()
      response = await send(accessToken)
    } catch {
      expireSession()
      throw error
    }
  }

  const payload = await readBody(response)
  if (!response.ok) throw toApiError(response.status, payload)
  if (!schema) return payload as z.infer<TSchema>

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new ApiError(
      'The server returned an unexpected response.',
      500,
      'RESPONSE_SHAPE',
      parsed.error.issues,
    )
  }
  return parsed.data
}

/**
 * True for the exception a cancelled request throws. Callers use it to tell
 * "the user pressed Stop" apart from "the request failed", which are very
 * different things to put on screen.
 */
export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

/** Exposed for the SSE transport, which manages its own fetch. */
export { refreshTokens, toApiError, expireSession }


//