/**
 * Values that must agree with the backend. Each one is annotated with the
 * server-side source of truth so a drift is obvious during review.
 */

/** multer `limits.fileSize` in src/api/document.js. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

/** The only mime type src/api/document.js accepts. */
export const ACCEPTED_UPLOAD_MIME = 'application/pdf'
export const ACCEPTED_UPLOAD_EXT = '.pdf'

/** MAX_QUERY_LENGTH in src/api/query.js. */
export const MAX_QUERY_CHARS = 2000

/** Warn at 90%, hard-stop at 100% (§12.4). */
export const QUERY_WARN_RATIO = 0.9

/** topK is only honoured by the API when it is an integer in [1, 20]. */
export const TOP_K_MIN = 1
export const TOP_K_MAX = 20

/** DEFAULT_TOP_K in src/rag/ragEngine.js. */
export const TOP_K_DEFAULT = 5

/** MIN_SIMILARITY_SCORE in src/rag/ragEngine.js — shown in RetrievalSettings. */
export const MIN_SIMILARITY_SCORE = 0.5

/** User.password validation bounds in src/models/User.js. */
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 128

/** firstName / lastName bounds in src/models/User.js. */
export const NAME_MAX = 50

/** Tenant.name and Tenant.slug bounds in src/models/Tenant.js. */
export const TENANT_NAME_MIN = 2
export const TENANT_NAME_MAX = 100
export const TENANT_SLUG_MIN = 2
export const TENANT_SLUG_MAX = 60

/** API key constants from backend src/services/apiKeyService.js */
export const API_KEY_NAME_MAX = 80
export const PUBLIC_MAX_KEYS_PER_TENANT = 25
export const PUBLIC_MAX_ORIGINS = 20
export const PUBLIC_DEFAULT_RATE_PER_MINUTE = 30
export const PUBLIC_DEFAULT_DAILY_QUOTA = 500
export const DEFAULT_ROTATION_GRACE_HOURS = 24
export const MAX_ROTATION_GRACE_HOURS = 720

/** Widget configuration constants from backend src/services/tenantService.js */
export const WIDGET_TITLE_MAX = 60
export const WIDGET_GREETING_MAX = 300
export const WIDGET_PLACEHOLDER_MAX = 80
export const WIDGET_FOOTER_NOTE_MAX = 120
export const WIDGET_SUGGESTIONS_MAX = 6
export const WIDGET_SUGGESTION_MAX_CHARS = 120

/** Public API chat query bounds */
export const PUBLIC_MAX_QUERY_CHARS = 1000
export const PUBLIC_MAX_HISTORY_TURNS = 6
export const PUBLIC_MAX_HISTORY_CHARS = 6000

/** localStorage / sessionStorage keys. Only tokenStorage.ts and uiStore write these. */
export const STORAGE_KEYS = {
  accessToken: 'docmind.accessToken',
  refreshToken: 'docmind.refreshToken',
  persist: 'docmind.persistSession',
  theme: 'docmind.theme',
  sidebarCollapsed: 'docmind.sidebarCollapsed',
  topK: 'docmind.topK',
  streaming: 'docmind.streaming',
} as const

/** Build-time feature flags (see .env.example). */
export const FEATURES = {
  passwordReset: import.meta.env.VITE_FEATURE_PASSWORD_RESET === 'true',
  chatHistory: import.meta.env.VITE_FEATURE_CHAT_HISTORY === 'true',
  mockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
} as const

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** The answer ragEngine.js returns when retrieval finds nothing above threshold. */
export const NO_CONTEXT_ANSWER =
  'I could not find any relevant information in the uploaded documents to answer your question.'

