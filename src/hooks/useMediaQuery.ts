import { useCallback, useSyncExternalStore } from 'react'

/**
 * The Tailwind breakpoints, available to TypeScript.
 *
 * Layout that only needs to *look* different belongs in CSS. This is for the
 * cases where the component tree itself must change — the sidebar becomes a
 * Drawer under `lg`, and rendering both while hiding one would put two copies
 * of every navigation link in the accessibility tree.
 */
export const BREAKPOINTS = {
  sm: '40rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
} as const

/**
 * A media query is external state, so it is read through `useSyncExternalStore`
 * rather than mirrored into `useState`: no effect, no first-paint flash at the
 * wrong breakpoint, and the value is consistent within a render pass.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const list = window.matchMedia(query)
      list.addEventListener('change', onStoreChange)
      return () => list.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  }, [query])

  // The server snapshot is deliberately pessimistic: assume the small layout.
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/** `lg` and up — where the sidebar stops being a drawer. */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg})`)
}
