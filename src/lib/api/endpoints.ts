import { ApiError, apiRequest } from './client'
import { API_BASE_URL } from '../constants'
import { isValidUuid } from '../utils'
import {
  apiKeyListResponseSchema,
  authResponseSchema,
  createApiKeyResponseSchema,
  createTenantResponseSchema,
  deleteDocumentResponseSchema,
  documentDetailResponseSchema,
  documentsResponseSchema,
  keyUsageResponseSchema,
  meResponseSchema,
  messageResponseSchema,
  publicChatResponseSchema,
  publicConfigResponseSchema,
  queryResponseSchema,
  rotateApiKeyResponseSchema,
  tenantMeResponseSchema,
  widgetResponseSchema,
  type ApiKey,
  type ApiKeyDefaults,
  type ApiKeyUsage,
  type CreateApiKeyResult,
  type DeleteDocumentResult,
  type DocumentDetailResponse,
  type DocumentRecord,
  type PublicChatResult,
  type PublicConfig,
  type QueryResult,
  type RotateApiKeyResult,
  type Tenant,
  type User,
  type WidgetConfig,
  type WidgetResponse,
} from './types'

export interface SignupInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthPayload {
  user: User
  accessToken: string
  refreshToken: string
}

export async function signup(input: SignupInput): Promise<AuthPayload> {
  const data = await apiRequest('/auth/signup', {
    method: 'POST',
    body: input,
    schema: authResponseSchema,
    anonymous: true,
  })
  return { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }
}

export async function login(input: LoginInput): Promise<AuthPayload> {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: input,
    schema: authResponseSchema,
    anonymous: true,
  })
  return { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }
}

export async function logout(refreshToken: string): Promise<void> {
  await apiRequest('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    schema: messageResponseSchema,
  })
}

export async function getCurrentUser(signal?: AbortSignal): Promise<User> {
  const data = await apiRequest('/auth/me', { schema: meResponseSchema, signal })
  return data.user
}

export interface CreateTenantInput {
  name: string
  slug: string
}

export async function createTenant(input: CreateTenantInput): Promise<{
  tenant: Tenant
  accessToken: string
  refreshToken: string
}> {
  const data = await apiRequest('/tenants', {
    method: 'POST',
    body: input,
    schema: createTenantResponseSchema,
  })
  return { tenant: data.tenant, accessToken: data.accessToken, refreshToken: data.refreshToken }
}

export async function getMyTenant(signal?: AbortSignal): Promise<Tenant> {
  const data = await apiRequest('/tenants/me', { schema: tenantMeResponseSchema, signal })
  return data.tenant
}

export async function listDocuments(
  tenantId: string,
  signal?: AbortSignal,
): Promise<DocumentRecord[]> {
  const data = await apiRequest(`/tenants/${tenantId}/documents`, {
    schema: documentsResponseSchema,
    signal,
  })
  return data.documents
}

export async function getDocument(
  tenantId: string,
  documentId: string,
  signal?: AbortSignal,
): Promise<DocumentDetailResponse> {
  if (!isValidUuid(documentId)) {
    throw new ApiError('Invalid document ID format', 400, 'INVALID_DOCUMENT_ID')
  }
  return apiRequest(`/tenants/${tenantId}/documents/${documentId}`, {
    schema: documentDetailResponseSchema,
    signal,
  })
}

export async function deleteDocument(
  tenantId: string,
  documentId: string,
): Promise<DeleteDocumentResult> {
  if (!isValidUuid(documentId)) {
    throw new ApiError('Invalid document ID format', 400, 'INVALID_DOCUMENT_ID')
  }
  return apiRequest(`/tenants/${tenantId}/documents/${documentId}`, {
    method: 'DELETE',
    schema: deleteDocumentResponseSchema,
  })
}

export interface ChatHistoryTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface AskInput {
  query: string
  topK?: number
  documentIds?: string[]
  history?: ChatHistoryTurn[]
  signal?: AbortSignal
}

export async function ask(tenantId: string, input: AskInput): Promise<QueryResult> {
  const { query, topK, documentIds, history, signal } = input
  const body: Record<string, unknown> = { query }
  if (topK !== undefined) body.topK = topK
  if (documentIds && documentIds.length > 0) body.documentIds = documentIds
  if (history && history.length > 0) body.history = history

  return apiRequest(`/tenants/${tenantId}/query`, {
    method: 'POST',
    body,
    schema: queryResponseSchema,
    signal,
  })
}

export interface CreateApiKeyInput {
  name: string
  type?: 'public' | 'secret'
  scopes?: string[]
  allowedOrigins?: string[]
  rateLimitPerMinute?: number | null
  dailyQuota?: number | null
}

export interface UpdateApiKeyInput {
  name?: string
  scopes?: string[]
  allowedOrigins?: string[]
  rateLimitPerMinute?: number | null
  dailyQuota?: number | null
}

export async function listApiKeys(
  tenantId: string,
  signal?: AbortSignal,
): Promise<{ apiKeys: ApiKey[]; scopes: string[]; defaults: ApiKeyDefaults }> {
  return apiRequest(`/tenants/${tenantId}/api-keys`, {
    schema: apiKeyListResponseSchema,
    signal,
  })
}

export async function createApiKey(
  tenantId: string,
  input: CreateApiKeyInput,
): Promise<CreateApiKeyResult> {
  return apiRequest(`/tenants/${tenantId}/api-keys`, {
    method: 'POST',
    body: input,
    schema: createApiKeyResponseSchema,
  })
}

export async function getKeyUsage(
  tenantId: string,
  keyId: string,
  signal?: AbortSignal,
): Promise<ApiKeyUsage> {
  if (!isValidUuid(keyId)) {
    throw new ApiError('Invalid key ID format', 400, 'INVALID_KEY_ID')
  }
  const data = await apiRequest(`/tenants/${tenantId}/api-keys/${keyId}/usage`, {
    schema: keyUsageResponseSchema,
    signal,
  })
  return data.usage
}

export async function updateApiKey(
  tenantId: string,
  keyId: string,
  input: UpdateApiKeyInput,
): Promise<ApiKey> {
  if (!isValidUuid(keyId)) {
    throw new ApiError('Invalid key ID format', 400, 'INVALID_KEY_ID')
  }
  const res = await apiRequest(`/tenants/${tenantId}/api-keys/${keyId}`, {
    method: 'PATCH',
    body: input,
  })
  return (res as { apiKey: ApiKey }).apiKey
}

export async function rotateApiKey(
  tenantId: string,
  keyId: string,
  input?: { graceHours?: number },
): Promise<RotateApiKeyResult> {
  if (!isValidUuid(keyId)) {
    throw new ApiError('Invalid key ID format', 400, 'INVALID_KEY_ID')
  }
  return apiRequest(`/tenants/${tenantId}/api-keys/${keyId}/rotate`, {
    method: 'POST',
    body: input ?? {},
    schema: rotateApiKeyResponseSchema,
  })
}

export async function deleteApiKey(tenantId: string, keyId: string): Promise<ApiKey> {
  if (!isValidUuid(keyId)) {
    throw new ApiError('Invalid key ID format', 400, 'INVALID_KEY_ID')
  }
  const res = await apiRequest(`/tenants/${tenantId}/api-keys/${keyId}`, {
    method: 'DELETE',
  })
  return (res as { apiKey: ApiKey }).apiKey
}

export async function getWidgetConfig(
  tenantId: string,
  signal?: AbortSignal,
): Promise<WidgetResponse> {
  return apiRequest(`/tenants/${tenantId}/widget`, {
    schema: widgetResponseSchema,
    signal,
  })
}

export async function updateWidgetConfig(
  tenantId: string,
  input: Partial<WidgetConfig>,
): Promise<WidgetResponse> {
  return apiRequest(`/tenants/${tenantId}/widget`, {
    method: 'PUT',
    body: input,
    schema: widgetResponseSchema,
  })
}

export async function getPublicConfig(apiKey: string, signal?: AbortSignal): Promise<PublicConfig> {
  const response = await fetch(`${API_BASE_URL}/public/config`, {
    headers: { 'X-Api-Key': apiKey },
    signal,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.error || `Failed to fetch public config (${response.status})`)
  }
  return publicConfigResponseSchema.parse(body)
}

export interface PublicChatInput {
  query: string
  sessionId?: string
  history?: ChatHistoryTurn[]
  documentIds?: string[]
  signal?: AbortSignal
}

export async function sendPublicChat(
  apiKey: string,
  input: PublicChatInput,
): Promise<PublicChatResult> {
  const response = await fetch(`${API_BASE_URL}/public/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
    body: JSON.stringify({
      query: input.query,
      sessionId: input.sessionId,
      history: input.history,
      documentIds: input.documentIds,
      stream: false,
    }),
    signal: input.signal,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.error || `Public chat failed (${response.status})`)
  }
  return publicChatResponseSchema.parse(body)
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    anonymous: true,
  })
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiRequest('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
    anonymous: true,
  })
}

export { uploadDocument, type UploadInput } from './upload'
