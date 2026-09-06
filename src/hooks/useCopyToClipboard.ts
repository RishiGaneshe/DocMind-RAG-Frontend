import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy text to the clipboard and report success for ~2s so a button can show a
 * check mark. Falls back to a hidden textarea + execCommand where the async
 * Clipboard API is unavailable (non-secure contexts, older Safari).
 */
export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      let ok = false
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
          ok = true
        } else {
          const area = document.createElement('textarea')
          area.value = text
          area.setAttribute('readonly', '')
          area.style.position = 'fixed'
          area.style.opacity = '0'
          document.body.appendChild(area)
          area.select()
          ok = document.execCommand('copy')
          document.body.removeChild(area)
        }
      } catch {
        ok = false
      }

      setCopied(ok)
      clearTimeout(timer.current)
      if (ok) timer.current = setTimeout(() => setCopied(false), resetAfterMs)
      return ok
    },
    [resetAfterMs],
  )

  return { copy, copied }
}
