import { create } from 'zustand'
import { STORAGE_KEYS, TOP_K_DEFAULT, TOP_K_MAX, TOP_K_MIN } from '@/lib/constants'
import { readJson, readStorage, removeStorage, writeJson, writeStorage } from '@/lib/storage'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface UiState {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void

  sidebarCollapsed: boolean
  toggleSidebarCollapsed: () => void
  sidebarDrawerOpen: boolean
  setSidebarDrawerOpen: (open: boolean) => void

  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  toggleCommandPalette: () => void

  topK: number
  setTopK: (topK: number) => void
  streaming: boolean
  setStreaming: (streaming: boolean) => void
}

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function storedPreference(): ThemePreference {
  const raw = readStorage('local', STORAGE_KEYS.theme)
  return raw === 'light' || raw === 'dark' ? raw : 'system'
}

function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = resolved
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'light' ? '#F7F9FB' : '#0A0D0F')
}

const initialPreference = storedPreference()

const clampTopK = (value: number) =>
  Math.min(Math.max(Math.round(value) || TOP_K_DEFAULT, TOP_K_MIN), TOP_K_MAX)

export const useUiStore = create<UiState>((set, get) => ({
  theme: initialPreference,
  resolvedTheme: resolve(initialPreference),
  setTheme: (theme) => {
    const resolved = resolve(theme)
    if (theme === 'system') removeStorage('local', STORAGE_KEYS.theme)
    else writeStorage('local', STORAGE_KEYS.theme, theme)
    applyTheme(resolved)
    set({ theme, resolvedTheme: resolved })
  },

  sidebarCollapsed: readJson('local', STORAGE_KEYS.sidebarCollapsed, false),
  toggleSidebarCollapsed: () => {
    const next = !get().sidebarCollapsed
    writeJson('local', STORAGE_KEYS.sidebarCollapsed, next)
    set({ sidebarCollapsed: next })
  },
  sidebarDrawerOpen: false,
  setSidebarDrawerOpen: (sidebarDrawerOpen) => set({ sidebarDrawerOpen }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  topK: clampTopK(readJson('local', STORAGE_KEYS.topK, TOP_K_DEFAULT)),
  setTopK: (value) => {
    const topK = clampTopK(value)
    writeJson('local', STORAGE_KEYS.topK, topK)
    set({ topK })
  },
  streaming: readJson('local', STORAGE_KEYS.streaming, true),
  setStreaming: (streaming) => {
    writeJson('local', STORAGE_KEYS.streaming, streaming)
    set({ streaming })
  },
}))

if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (useUiStore.getState().theme !== 'system') return
    const resolved = systemTheme()
    applyTheme(resolved)
    useUiStore.setState({ resolvedTheme: resolved })
  })
}

applyTheme(resolve(initialPreference))
