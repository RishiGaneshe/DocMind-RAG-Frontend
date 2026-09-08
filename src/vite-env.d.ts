/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PROXY_TARGET?: string
  readonly VITE_FEATURE_PASSWORD_RESET?: string
  readonly VITE_FEATURE_CHAT_HISTORY?: string
  readonly VITE_ENABLE_MOCK_API?: string
  readonly VITE_CHAT_PUBLIC_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
