import { useEffect, useRef } from 'react'

const isEditable = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable ||
    target.closest('[role="textbox"]') !== null
  )
}

interface Options {
  /** Fire even while a text field has focus. Off by default. */
  enableInFormFields?: boolean
  enabled?: boolean
}

/**
 * Bind a hotkey described as `"mod+k"`, `"shift+?"`, `"escape"`.
 *
 * `mod` maps to Meta on Apple platforms and Control elsewhere. Bindings are
 * ignored while the user is typing unless `enableInFormFields` is set, so the
 * command palette cannot steal a keystroke from the composer.
 */
export function useHotkey(
  combo: string,
  handler: (event: KeyboardEvent) => void,
  { enableInFormFields = false, enabled = true }: Options = {},
): void {
  // Kept in a ref so a new closure on every parent render does not detach and
  // reattach the window listener. Written in an effect, not during render.
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    const parts = combo.toLowerCase().split('+')
    const key = parts[parts.length - 1]
    const needMod = parts.includes('mod')
    const needShift = parts.includes('shift')
    const needAlt = parts.includes('alt')

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key) return
      const isApple = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)
      const mod = isApple ? event.metaKey : event.ctrlKey
      if (needMod !== mod) return
      if (needShift !== event.shiftKey) return
      if (needAlt !== event.altKey) return
      if (!enableInFormFields && isEditable(event.target)) return
      handlerRef.current(event)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo, enabled, enableInFormFields])
}
