import { STORAGE_KEYS } from './constants'
import { readStorage, removeStorage, writeStorage } from './storage'

/**
 * The only module that knows where credentials live.
 *
 * Tokens are in Web Storage for this phase, which means an XSS bug can read
 * them. That is a known, documented trade-off (§20.3): the backend has no
 * cookie-based auth yet, and every consumer goes through this module, so the
 * migration to httpOnly cookies is a change here plus deleting the Authorization
 * header in client.ts — not an audit of the whole app.
 *
 * "Remember me" chooses the backing store: localStorage survives a browser
 * restart, sessionStorage dies with the tab.
 */

type Kind = 'local' | 'session'

/** Which store the current session lives in. Persisted so a reload can find it. */
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

  /**
   * @param persist `true` → localStorage ("remember me"), `false` → sessionStorage.
   *   Omit to keep whatever the current session already chose, which is what
   *   token refresh and the workspace-creation token reissue both want.
   */
  set({ accessToken, refreshToken }: TokenPair, persist?: boolean): void {
    const kind: Kind = persist === undefined ? activeKind() : persist ? 'local' : 'session'

    // Moving stores? Clear the old one so two copies never disagree.
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
