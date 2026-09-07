import { API_BASE_URL } from '../constants'
import { tokenStorage } from '../tokenStorage'
import { ApiError, expireSession, refreshTokens, toApiError } from './client'
import { uploadResponseSchema, type UploadResult } from './types'

export interface UploadInput {
  tenantId: string
  file: File
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
    body.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/tenants/${tenantId}/documents`)
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
