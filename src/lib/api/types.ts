import { z } from 'zod'

/**
 * Runtime-validated mirrors of the Express responses.
 *
 * Every response the app depends on is parsed, not cast: a backend change that
 * drops a field surfaces as one legible error at the boundary instead of an
 * `undefined` three components deep. Unknown keys are stripped, so the server
 * can add fields freely.
 */

export const roleSchema = z.enum(['owner', 'member'])

export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  /** Only present on /auth/me and /tenants/me — never in the JWT. */
  apiKey: z.string().optional(),
  ownerId: z.string().optional(),
  createdAt: z.string().optional(),
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: roleSchema,
  tenantId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  lastLoginAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  /** getUserProfile() eager-loads the workspace; login/signup do not. */
  tenant: tenantSchema.nullable().optional(),
})

export const authResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  user: userSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const refreshResponseSchema = z.object({
  success: z.literal(true),
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const meResponseSchema = z.object({
  success: z.literal(true),
  user: userSchema,
})

export const messageResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
})

/** POST /api/tenants reissues both tokens with tenantId baked in. */
export const createTenantResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  tenant: tenantSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const tenantMeResponseSchema = z.object({
  success: z.literal(true),
  tenant: tenantSchema,
})

export const documentStatusSchema = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])

export const documentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  /** Sequelize INTEGER arrives as a number; be tolerant of a stringified one. */
  fileSize: z.coerce.number(),
  totalChunks: z.coerce.number(),
  status: documentStatusSchema,
  createdAt: z.string(),
})

export const documentsResponseSchema = z.object({
  success: z.literal(true),
  documents: z.array(documentSchema),
})

export const uploadResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  documentId: z.string(),
  filename: z.string(),
  chunksProcessed: z.coerce.number(),
  /** Chunks the embedder skipped — surfaced verbatim after upload (§12.6). */
  chunksSkipped: z.coerce.number(),
  totalChunks: z.coerce.number(),
  pages: z.coerce.number().optional(),
})

export const sourceSchema = z.object({
  documentId: z.string(),
  chunkIndex: z.coerce.number(),
  relevanceScore: z.coerce.number(),
  snippet: z.string(),
})

/** Non-streaming POST …/query. */
export const queryResponseSchema = z.object({
  success: z.literal(true),
  answer: z.string(),
  sources: z.array(sourceSchema),
  query: z.string(),
  chunksUsed: z.coerce.number().optional(),
})

/* --- SSE frame payloads (§20.2) ----------------------------------------- */

export const sseSourcesSchema = z.object({
  sources: z.array(sourceSchema),
  query: z.string(),
  chunksUsed: z.coerce.number().optional(),
})

export const sseChunkSchema = z.object({ content: z.string() })
export const sseDoneSchema = z.object({ success: z.boolean().optional() })
export const sseErrorSchema = z.object({ error: z.string() })

/** Every failing route answers `{ success: false, error, code? }`. */
export const errorResponseSchema = z.object({
  success: z.literal(false).optional(),
  error: z.string().optional(),
  code: z.string().optional(),
})

export type Role = z.infer<typeof roleSchema>
export type Tenant = z.infer<typeof tenantSchema>
export type User = z.infer<typeof userSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type DocumentStatus = z.infer<typeof documentStatusSchema>
export type DocumentRecord = z.infer<typeof documentSchema>
export type UploadResult = z.infer<typeof uploadResponseSchema>
export type Source = z.infer<typeof sourceSchema>
export type QueryResult = z.infer<typeof queryResponseSchema>

//