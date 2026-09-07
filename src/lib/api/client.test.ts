import { describe, expect, it } from 'vitest'
import { ApiError, normaliseError, toApiError } from './client'

describe('normaliseError', () => {
  it('handles Shape A: Express error handler with message and code', () => {
    const json = {
      success: false,
      error: 'Tenant document quota exceeded',
      code: 'QUOTA_EXCEEDED',
    }
    const err = normaliseError(403, json)
    expect(err.message).toBe('Tenant document quota exceeded')
    expect(err.code).toBe('QUOTA_EXCEEDED')

    const apiErr = toApiError(403, json)
    expect(apiErr).toBeInstanceOf(ApiError)
    expect(apiErr.code).toBe('QUOTA_EXCEEDED')
  })

  it('handles Shape B: nested error object { error: { message } }', () => {
    const json = {
      error: {
        message: 'Invalid API key format',
      },
      code: 'UNAUTHORIZED',
    }
    const err = normaliseError(401, json)
    expect(err.message).toBe('Invalid API key format')
    expect(err.code).toBeUndefined()
  })

  it('handles Shape C: 404 handler with error as string', () => {
    const json = {
      error: 'Document not found',
    }
    const err = normaliseError(404, json)
    expect(err.message).toBe('Document not found')
  })

  it('handles HTML / proxy error pages without crashing', () => {
    const html = '<html><body>502 Bad Gateway</body></html>'
    const err = normaliseError(502, html)
    expect(err.message).toBe('The answering service is unavailable right now.')
    expect(err.code).toBeUndefined()
  })

  it('detects 429 rate limits and extracts retryAfterSeconds', () => {
    const json = {
      error: 'Too many requests, slow down',
      code: 'RATE_LIMITED',
      retryAfterSeconds: 45,
    }
    const headers = new Headers({ 'Retry-After': '45' })
    const err = normaliseError(429, json, headers)
    expect(err.retryAfter).toBe(45)
  })
})
