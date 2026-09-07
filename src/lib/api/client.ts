import { API_BASE_URL } from '../constants'
import { tokenStorage, type TokenPair } from '../tokenStorage'
import { refreshResponseSchema } from './types'
import type { z } from 'zod'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown
  readonly retryAfter: number | null

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
    retryAfter: number | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.retryAfter = retryAfter
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isRateLimited(): boolean {
    return this.status === 429
  }

  get isTenantRequired(): boolean {
    return this.status === 403 && this.code === 'TENANT_REQUIRED'
  }

  get isTenantMismatch(): boolean {
    return this.status === 403 && this.code === 'TENANT_MISMATCH'
  }
}

type SessionExpiredHandler = () => void
let onSessionExpired: SessionExpiredHandler | null = null

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  onSessionExpired = handler
}

function expireSession(): void {
  tokenStorage.clear()
  onSessionExpired?.()
}

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
  if (!response.ok) throw toApiError(response.status, payload, response.headers)

  const parsed = refreshResponseSchema.safeParse(payload)
  if (!parsed.success) throw new ApiError('Malformed refresh response', 500, 'RESPONSE_SHAPE')

  const pair = { accessToken: parsed.data.accessToken, refreshToken: parsed.data.refreshToken }
  tokenStorage.set(pair)
  return pair
}

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
  504: 'The request timed out. Please try again.',
}

export function normaliseError(
  status: number,
  body: unknown,
  headers?: Headers,
): { message: string; code?: string; retryAfter: number | null } {
  let retryAfter =
    (headers && typeof headers.get === 'function' ? Number(headers.get('Retry-After')) : null) ||
    (body && typeof body === 'object' && 'retryAfterSeconds' in body
      ? Number((body as { retryAfterSeconds?: unknown }).retryAfterSeconds)
      : null) ||
    null

  if (
    body &&
    typeof body === 'object' &&
    'error' in body &&
    typeof (body as { error: unknown }).error === 'object' &&
    (body as { error: unknown }).error !== null
  ) {
    const msg = (body as { error: { message?: string } }).error.message ?? 'Request failed'
    return { message: msg, code: undefined, retryAfter }
  }

  if (
    body &&
    typeof body === 'object' &&
    'error' in body &&
    typeof (body as { error: unknown }).error === 'string'
  ) {
    const errorStr = (body as { error: string }).error
    const codeStr =
      'code' in body && typeof (body as { code: unknown }).code === 'string'
        ? (body as { code: string }).code
        : undefined
    return { message: errorStr, code: codeStr, retryAfter }
  }

  if (typeof body === 'string' && body.trim()) {
    if (body.trim().startsWith('<')) {
      return {
        message: STATUS_FALLBACKS[status] ?? `Service responded with status ${status}.`,
        code: undefined,
        retryAfter,
      }
    }
    return { message: body.trim(), code: undefined, retryAfter }
  }

  return {
    message: STATUS_FALLBACKS[status] ?? `Request failed with status ${status}.`,
    code: undefined,
    retryAfter,
  }
}

export function toApiError(status: number, payload: unknown, headers?: Headers): ApiError {
  const norm = normaliseError(status, payload, headers)
  return new ApiError(norm.message, status, norm.code, payload, norm.retryAfter)
}

export interface RequestOptions<TSchema extends z.ZodType> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  schema?: TSchema
  signal?: AbortSignal
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

  if (response.status === 401 && !anonymous) {
    const payload = await readBody(response)
    const error = toApiError(401, payload, response.headers)

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
  if (!response.ok) throw toApiError(response.status, payload, response.headers)
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

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export { refreshTokens, expireSession }