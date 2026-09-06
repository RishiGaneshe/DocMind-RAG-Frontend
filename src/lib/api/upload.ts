import { API_BASE_URL } from '../constants'
import { tokenStorage } from '../tokenStorage'
import { ApiError, expireSession, refreshTokens, toApiError } from './client'
import { uploadResponseSchema, type UploadResult } from './types'

/**
 * Uploads go through XMLHttpRequest, not fetch.
 *
 * `fetch` still has no upload-progress event in any shipping browser, and a
 * 10 MB PDF on a slow connection with an indeterminate spinner feels broken.
 * XHR gives real bytes-sent numbers, so the progress bar means something.
 */

export interface UploadInput {
  tenantId: string
  file: File
  /** 0–1. Fired on every progress event the browser emits. */
  onProgress?: (fraction: number) => void
  signal?: AbortSignal
}

interface RawResult {
  status: number
  payload: unknown
}

function send(
  tenantId: string,
  file: File,
  token: string | null,
  onProgress: ((fraction: number) => void) | undefined,
  signal: AbortSignal | undefined,
): Promise<RawResult> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Upload aborted', 'AbortError'))
      return
    }

    const body = new FormData()
    // multer is configured as upload.single('file') — the name must match.
    body.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/tenants/${tenantId}/documents`)
    // Content-Type is deliberately unset: the browser adds the multipart
    // boundary, and overriding it makes multer fail to find any field.
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.responseType = 'text'

    const onAbort = () => xhr.abort()
    signal?.addEventListener('abort', onAbort, { once: true })

    const cleanup = () => signal?.removeEventListener('abort', onAbort)

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(event.loaded / event.total)
      }
    }

    xhr.onload = () => {
      cleanup()
      let payload: unknown = null
      const text = xhr.responseText
      if (text) {
        try {
          payload = JSON.parse(text) as unknown
        } catch {
          payload = text
        }
      }
      resolve({ status: xhr.status, payload })
    }

    xhr.onerror = () => {
      cleanup()
      reject(
        new ApiError('Could not reach the server. Check your connection and try again.', 0, 'NETWORK'),
      )
    }

    xhr.ontimeout = () => {
      cleanup()
      reject(new ApiError('The upload timed out.', 0, 'TIMEOUT'))
    }

    xhr.onabort = () => {
      cleanup()
      reject(new DOMException('Upload aborted', 'AbortError'))
    }

    xhr.send(body)
  })
}

export async function uploadDocument({
  tenantId,
  file,
  onProgress,
  signal,
}: UploadInput): Promise<UploadResult> {
  let result = await send(tenantId, file, tokenStorage.getAccessToken(), onProgress, signal)

  // Embedding a large PDF is slow; the access token can expire mid-upload.
  // Refresh and resend once rather than making the user pick the file again.
  if (result.status === 401) {
    const error = toApiError(401, result.payload)
    if (error.code === 'TOKEN_REVOKED' || !tokenStorage.getRefreshToken()) {
      expireSession()
      throw error
    }
    try {
      const { accessToken } = await refreshTokens()
      onProgress?.(0)
      result = await send(tenantId, file, accessToken, onProgress, signal)
    } catch {
      expireSession()
      throw error
    }
  }

  if (result.status < 200 || result.status >= 300) throw toApiError(result.status, result.payload)

  const parsed = uploadResponseSchema.safeParse(result.payload)
  if (!parsed.success) {
    throw new ApiError(
      'The upload finished but the server returned an unexpected response.',
      500,
      'RESPONSE_SHAPE',
      parsed.error.issues,
    )
  }
  return parsed.data
}
