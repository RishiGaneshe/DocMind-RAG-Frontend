export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ACCEPTED_UPLOAD_MIME = 'application/pdf'
export const ACCEPTED_UPLOAD_EXT = '.pdf'

export const MAX_QUERY_CHARS = 2000
export const QUERY_WARN_RATIO = 0.9

export const TOP_K_MIN = 1
export const TOP_K_MAX = 20
export const TOP_K_DEFAULT = 5
export const MIN_SIMILARITY_SCORE = 0.5

export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 128
export const NAME_MAX = 50

export const TENANT_NAME_MIN = 2
export const TENANT_NAME_MAX = 100
export const TENANT_SLUG_MIN = 2
export const TENANT_SLUG_MAX = 60

export const API_KEY_NAME_MAX = 80
export const PUBLIC_MAX_KEYS_PER_TENANT = 25
export const PUBLIC_MAX_ORIGINS = 20
export const PUBLIC_DEFAULT_RATE_PER_MINUTE = 30
export const PUBLIC_DEFAULT_DAILY_QUOTA = 500
export const DEFAULT_ROTATION_GRACE_HOURS = 24
export const MAX_ROTATION_GRACE_HOURS = 720

export const WIDGET_TITLE_MAX = 60
export const WIDGET_GREETING_MAX = 300
export const WIDGET_PLACEHOLDER_MAX = 80
export const WIDGET_FOOTER_NOTE_MAX = 120
export const WIDGET_SUGGESTIONS_MAX = 6
export const WIDGET_SUGGESTION_MAX_CHARS = 120

export const PUBLIC_MAX_QUERY_CHARS = 1000
export const PUBLIC_MAX_HISTORY_TURNS = 6
export const PUBLIC_MAX_HISTORY_CHARS = 6000

export const STORAGE_KEYS = {
  accessToken: 'docmind.accessToken',
  refreshToken: 'docmind.refreshToken',
  persist: 'docmind.persistSession',
  theme: 'docmind.theme',
  sidebarCollapsed: 'docmind.sidebarCollapsed',
  topK: 'docmind.topK',
  streaming: 'docmind.streaming',
} as const

export const FEATURES = {
  passwordReset: import.meta.env.VITE_FEATURE_PASSWORD_RESET === 'true',
  chatHistory: import.meta.env.VITE_FEATURE_CHAT_HISTORY === 'true',
  mockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
} as const

function normalizeApiBaseUrl(raw?: string): string {
  if (!raw || !raw.trim()) {
    return import.meta.env.PROD ? 'https://api.codewithrishi.fun/api' : '/api'
  }
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (trimmed.endsWith('/api')) return trimmed
  return `${trimmed}/api`
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

export const CHAT_PUBLIC_KEY =
  import.meta.env.VITE_CHAT_PUBLIC_KEY?.trim() ||
  'pk_live_yUC6ib29LRemN9Mq7TNo2NhB2yALG6SAN-RqdgRSMWI'

export const NO_CONTEXT_ANSWER =
  'I could not find any relevant information in the uploaded documents to answer your question.'


