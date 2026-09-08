import { z } from 'zod'

export const roleSchema = z.enum(['owner', 'member'])

export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  apiKey: z.string().optional(),
  ownerId: z.string().optional(),
  widgetConfig: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
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
  fileSize: z.coerce.number(),
  totalChunks: z.coerce.number(),
  numPages: z.coerce.number().nullable().optional(),
  status: documentStatusSchema,
  failureReason: z.string().nullable().optional(),
  processingStartedAt: z.string().nullable().optional(),
  processingCompletedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export const documentsResponseSchema = z.object({
  success: z.literal(true),
  documents: z.array(documentSchema),
})

export const documentDetailResponseSchema = z.object({
  success: z.literal(true),
  document: documentSchema,
  processing: z.boolean().optional(),
})

export const deleteDocumentResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  documentId: z.string(),
  vectorsDeleted: z.coerce.number().optional(),
  chunksDeleted: z.coerce.number().optional(),
})

export const uploadResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  documentId: z.string().optional(),
  filename: z.string().optional(),
  status: documentStatusSchema.optional(),
  statusUrl: z.string().optional(),
  queuePosition: z.coerce.number().optional(),
  duplicate: z.boolean().optional(),
  document: documentSchema.optional(),
  chunksProcessed: z.coerce.number().optional(),
  chunksSkipped: z.coerce.number().optional(),
  totalChunks: z.coerce.number().optional(),
  pages: z.coerce.number().optional(),
})

export const sourceSchema = z.object({
  citation: z.coerce.number().optional(),
  documentId: z.string(),
  filename: z.string().optional(),
  chunkIndex: z.coerce.number(),
  page: z.coerce.number().nullable().optional(),
  breadcrumb: z.string().nullable().optional(),
  relevanceScore: z.coerce.number(),
  scoreType: z.string().optional(),
  snippet: z.string(),
})

export const publicSourceSchema = z.object({
  citation: z.coerce.number(),
  filename: z.string().optional(),
  page: z.coerce.number().nullable().optional(),
  documentId: z.string().optional(),
  chunkIndex: z.coerce.number().optional(),
  breadcrumb: z.string().nullable().optional(),
  relevanceScore: z.coerce.number().optional(),
  snippet: z.string().optional(),
})

export const queryResponseSchema = z.object({
  success: z.literal(true),
  answer: z.string(),
  sources: z.array(sourceSchema),
  citedSources: z.array(z.coerce.number()).optional(),
  query: z.string(),
  searchQuery: z.string().optional(),
  rewritten: z.boolean().optional(),
  chunksUsed: z.coerce.number().optional(),
  retrieval: z.record(z.string(), z.unknown()).optional(),
  cached: z.boolean().optional(),
})

export const sseSourcesSchema = z.object({
  sources: z.array(sourceSchema),
  query: z.string().optional(),
  searchQuery: z.string().optional(),
  rewritten: z.boolean().optional(),
  chunksUsed: z.coerce.number().optional(),
})

export const publicSseSourcesSchema = z.object({
  sources: z.array(publicSourceSchema),
  chunksUsed: z.coerce.number().optional(),
})

export const sseChunkSchema = z.object({ content: z.string() })
export const sseDoneSchema = z.object({ success: z.boolean().optional() })
export const sseErrorSchema = z.object({ error: z.string() })

export const apiKeyTypeSchema = z.enum(['public', 'secret'])
export const apiKeyStatusSchema = z.enum(['active', 'revoked', 'expired'])

export const apiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: apiKeyTypeSchema,
  maskedKey: z.string(),
  keyPrefix: z.string(),
  scopes: z.array(z.string()),
  allowedOrigins: z.array(z.string()),
  unrestricted: z.boolean(),
  rateLimitPerMinute: z.coerce.number().nullable(),
  dailyQuota: z.coerce.number().nullable(),
  lastUsedAt: z.string().nullable().optional(),
  totalRequests: z.coerce.number(),
  expiresAt: z.string().nullable().optional(),
  revokedAt: z.string().nullable().optional(),
  status: apiKeyStatusSchema,
  createdAt: z.string(),
})

export const apiKeyDefaultsSchema = z.object({
  ratePerMinute: z.coerce.number(),
  visitorRatePerMinute: z.coerce.number(),
  dailyQuota: z.coerce.number(),
  maxKeysPerTenant: z.coerce.number(),
  originsRequired: z.boolean(),
})

export const apiKeyListResponseSchema = z.object({
  success: z.literal(true),
  apiKeys: z.array(apiKeySchema),
  scopes: z.array(z.string()),
  defaults: apiKeyDefaultsSchema,
})

export const createApiKeyResponseSchema = z.object({
  success: z.literal(true),
  key: z.string(),
  warning: z.string().optional(),
  apiKey: apiKeySchema,
})

export const apiKeyUsageSchema = apiKeySchema.extend({
  todayUsed: z.coerce.number().nullable(),
  dailyQuotaEffective: z.coerce.number().optional(),
  rateLimitEffective: z.coerce.number().optional(),
})

export const keyUsageResponseSchema = z.object({
  success: z.literal(true),
  usage: apiKeyUsageSchema,
})

export const rotateApiKeyResponseSchema = z.object({
  success: z.literal(true),
  key: z.string(),
  warning: z.string().optional(),
  apiKey: apiKeySchema,
  previous: apiKeySchema,
})

export const sourceModeSchema = z.enum(['full', 'labels', 'hidden'])

export const widgetConfigSchema = z.object({
  title: z.string(),
  greeting: z.string(),
  placeholder: z.string(),
  suggestions: z.array(z.string()),
  accentColor: z.string(),
  position: z.enum(['left', 'right']),
  showBranding: z.boolean(),
  footerNote: z.string().optional().default(''),
  sourceMode: sourceModeSchema,
  enabled: z.boolean().optional().default(true),
})

export const widgetResponseSchema = z.object({
  success: z.literal(true),
  widget: widgetConfigSchema,
  defaults: widgetConfigSchema.optional(),
  sourceModes: z.array(sourceModeSchema).optional(),
})

export const publicConfigResponseSchema = z.object({
  success: z.literal(true),
  workspace: z.object({ name: z.string() }),
  widget: widgetConfigSchema,
  limits: z.object({
    maxQueryLength: z.coerce.number(),
    maxHistoryTurns: z.coerce.number(),
  }),
  capabilities: z.object({
    filterByDocument: z.boolean(),
  }),
})

export const publicChatResponseSchema = z.object({
  success: z.literal(true),
  answer: z.string(),
  sources: z.array(publicSourceSchema),
  citedSources: z.array(z.coerce.number()).optional(),
  chunksUsed: z.coerce.number().optional(),
})

export const errorResponseSchema = z.object({
  success: z.literal(false).optional(),
  error: z.union([z.string(), z.object({ message: z.string().optional() })]).optional(),
  code: z.string().optional(),
  retryAfterSeconds: z.coerce.number().optional(),
  path: z.string().optional(),
})

export type Role = z.infer<typeof roleSchema>
export type Tenant = z.infer<typeof tenantSchema>
export type User = z.infer<typeof userSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type DocumentStatus = z.infer<typeof documentStatusSchema>
export type DocumentRecord = z.infer<typeof documentSchema>
export type DocumentDetailResponse = z.infer<typeof documentDetailResponseSchema>
export type DeleteDocumentResult = z.infer<typeof deleteDocumentResponseSchema>
export type UploadResult = z.infer<typeof uploadResponseSchema>
export type Source = z.infer<typeof sourceSchema>
export type PublicSource = z.infer<typeof publicSourceSchema>
export type QueryResult = z.infer<typeof queryResponseSchema>
export type ApiKeyType = z.infer<typeof apiKeyTypeSchema>
export type ApiKeyStatus = z.infer<typeof apiKeyStatusSchema>
export type ApiKey = z.infer<typeof apiKeySchema>
export type ApiKeyDefaults = z.infer<typeof apiKeyDefaultsSchema>
export type ApiKeyUsage = z.infer<typeof apiKeyUsageSchema>
export type CreateApiKeyResult = z.infer<typeof createApiKeyResponseSchema>
export type RotateApiKeyResult = z.infer<typeof rotateApiKeyResponseSchema>
export type SourceMode = z.infer<typeof sourceModeSchema>
export type WidgetConfig = z.infer<typeof widgetConfigSchema>
export type WidgetResponse = z.infer<typeof widgetResponseSchema>
export type PublicConfig = z.infer<typeof publicConfigResponseSchema>
export type PublicChatResult = z.infer<typeof publicChatResponseSchema>