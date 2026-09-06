import { apiRequest } from './client'
import {
  authResponseSchema,
  createTenantResponseSchema,
  documentsResponseSchema,
  meResponseSchema,
  messageResponseSchema,
  queryResponseSchema,
  tenantMeResponseSchema,
  type DocumentRecord,
  type QueryResult,
  type Tenant,
  type User,
} from './types'

/**
 * One function per backend route, named after the intent rather than the verb.
 *
 * Paths are written out in full so `grep '/api/tenants'` finds every caller.
 * Documents and query are nested under the tenant (see src/app.js) — passing
 * the wrong tenantId gets a 403 TENANT_MISMATCH from requireTenant, which the
 * UI surfaces as a session problem rather than a 404.
 */

/* --- Auth ---------------------------------------------------------------- */

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

/**
 * Revokes the refresh token server-side. Best-effort: the UI clears local
 * credentials whether or not this succeeds, so a network failure can never
 * leave someone stuck in a session they asked to leave.
 */
export async function logout(refreshToken: string): Promise<void> {
  await apiRequest('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    schema: messageResponseSchema,
  })
}

/** The session probe on boot. Eager-loads `user.tenant`, unlike login/signup. */
export async function getCurrentUser(signal?: AbortSignal): Promise<User> {
  const data = await apiRequest('/auth/me', { schema: meResponseSchema, signal })
  return data.user
}

/* --- Workspace ----------------------------------------------------------- */

export interface CreateTenantInput {
  name: string
  slug: string
}

/**
 * Creating a workspace mints new tokens with `tenantId` baked into the JWT —
 * the old access token has no tenant claim and would 403 on every document and
 * query route, so the caller must store this pair immediately.
 */
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

/** 404 here means "no workspace yet", which is a normal state, not an error. */
export async function getMyTenant(signal?: AbortSignal): Promise<Tenant> {
  const data = await apiRequest('/tenants/me', { schema: tenantMeResponseSchema, signal })
  return data.tenant
}

/* --- Documents ----------------------------------------------------------- */

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

/* --- Query --------------------------------------------------------------- */

export interface AskInput {
  query: string
  topK?: number
  signal?: AbortSignal
}

/**
 * Non-streaming answer. Used when the user turns streaming off, and as the
 * fallback path when the SSE transport cannot start (§20.2).
 */
export async function ask(tenantId: string, { query, topK, signal }: AskInput): Promise<QueryResult> {
  return apiRequest(`/tenants/${tenantId}/query`, {
    method: 'POST',
    body: { query, ...(topK === undefined ? {} : { topK }) },
    schema: queryResponseSchema,
    signal,
  })
}

/* --- Password recovery (contract only) ----------------------------------- */

/**
 * These two routes DO NOT EXIST on the server yet (§13.3, §22 item 8). They are
 * written against the agreed contract and reached only when
 * `VITE_FEATURE_PASSWORD_RESET` is on, so the UI can be built and reviewed now
 * and wiring it later is a backend change, not a frontend one.
 *
 *   POST /api/auth/forgot-password  { email }           → 200 always
 *   POST /api/auth/reset-password   { token, password } → 200 | 400 | 410
 */
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
