/**
 * The single choke point for the Web Storage API.
 *
 * Everything that persists across reloads goes through here — tokenStorage.ts
 * for credentials, uiStore for preferences — so the eventual move to httpOnly
 * cookies (§20.3) touches two files, and a storage-denied browser (Safari
 * private mode, hardened enterprise profiles) degrades to in-memory instead of
 * throwing on module load.
 */

type Kind = 'local' | 'session'

const memory = new Map<string, string>()

function backend(kind: Kind): Storage | null {
  try {
    const store = kind === 'local' ? window.localStorage : window.sessionStorage
    // Access alone can throw when storage is blocked; touch it to be sure.
    const probe = '__docmind_probe__'
    store.setItem(probe, '1')
    store.removeItem(probe)
    return store
  } catch {
    return null
  }
}

function memoryKey(kind: Kind, key: string) {
  return `${kind}:${key}`
}

export function readStorage(kind: Kind, key: string): string | null {
  const store = backend(kind)
  if (!store) return memory.get(memoryKey(kind, key)) ?? null
  try {
    return store.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(kind: Kind, key: string, value: string): void {
  const store = backend(kind)
  if (!store) {
    memory.set(memoryKey(kind, key), value)
    return
  }
  try {
    store.setItem(key, value)
  } catch {
    memory.set(memoryKey(kind, key), value)
  }
}

export function removeStorage(kind: Kind, key: string): void {
  memory.delete(memoryKey(kind, key))
  const store = backend(kind)
  if (!store) return
  try {
    store.removeItem(key)
  } catch {
    /* nothing to do — the value is already unreachable */
  }
}

/** Read a JSON value, returning `fallback` when absent or corrupt. */
export function readJson<T>(kind: Kind, key: string, fallback: T): T {
  const raw = readStorage(kind, key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(kind: Kind, key: string, value: unknown): void {
  writeStorage(kind, key, JSON.stringify(value))
}
