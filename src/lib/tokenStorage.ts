import { STORAGE_KEYS } from './constants'
import { readStorage, removeStorage, writeStorage } from './storage'

type Kind = 'local' | 'session'

function activeKind(): Kind {
  return readStorage('local', STORAGE_KEYS.persist) === 'session' ? 'session' : 'local'
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export const tokenStorage = {
  get(): TokenPair | null {
    const kind = activeKind()
    const accessToken = readStorage(kind, STORAGE_KEYS.accessToken)
    const refreshToken = readStorage(kind, STORAGE_KEYS.refreshToken)
    if (!accessToken || !refreshToken) return null
    return { accessToken, refreshToken }
  },

  getAccessToken(): string | null {
    return readStorage(activeKind(), STORAGE_KEYS.accessToken)
  },

  getRefreshToken(): string | null {
    return readStorage(activeKind(), STORAGE_KEYS.refreshToken)
  },

  set({ accessToken, refreshToken }: TokenPair, persist?: boolean): void {
    const kind: Kind = persist === undefined ? activeKind() : persist ? 'local' : 'session'

    if (kind !== activeKind()) tokenStorage.clear()

    writeStorage('local', STORAGE_KEYS.persist, kind)
    writeStorage(kind, STORAGE_KEYS.accessToken, accessToken)
    writeStorage(kind, STORAGE_KEYS.refreshToken, refreshToken)
  },

  clear(): void {
    for (const kind of ['local', 'session'] as const) {
      removeStorage(kind, STORAGE_KEYS.accessToken)
      removeStorage(kind, STORAGE_KEYS.refreshToken)
    }
    removeStorage('local', STORAGE_KEYS.persist)
  },

  isPersistent(): boolean {
    return activeKind() === 'local'
  },
}
