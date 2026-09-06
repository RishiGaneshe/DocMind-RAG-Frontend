import { useEffect } from 'react'

const SUFFIX = 'DocMind'

/**
 * Sets `document.title` for the lifetime of a route.
 *
 * A data router does not touch the title, and a SPA that never changes it makes
 * the back button and the tab bar useless — every entry in history reads the
 * same. Restoring the previous title on unmount keeps nested routes honest.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title === SUFFIX ? SUFFIX : `${title} · ${SUFFIX}`
    return () => {
      document.title = previous
    }
  }, [title])
}
