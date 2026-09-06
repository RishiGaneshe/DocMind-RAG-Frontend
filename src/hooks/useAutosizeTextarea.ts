import { useCallback, useEffect, useRef } from 'react'

interface Options {
  /** Rows to show before the textarea starts scrolling. */
  maxRows?: number
  minRows?: number
}

/**
 * Grow a textarea with its content between `minRows` and `maxRows`, then let it
 * scroll. Measures the real line-height from computed styles rather than
 * assuming one, so it stays correct if the type scale changes.
 */
export function useAutosizeTextarea(
  value: string,
  { maxRows = 8, minRows = 1 }: Options = {},
): React.RefObject<HTMLTextAreaElement | null> {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return

    const styles = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(styles.lineHeight) || 24
    const paddingY = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom)
    const borderY =
      Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth)

    const min = lineHeight * minRows + paddingY + borderY
    const max = lineHeight * maxRows + paddingY + borderY

    el.style.height = 'auto'
    const next = Math.min(Math.max(el.scrollHeight + borderY, min), max)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight + borderY > max ? 'auto' : 'hidden'
  }, [maxRows, minRows])

  useEffect(resize, [value, resize])

  useEffect(() => {
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [resize])

  return ref
}
