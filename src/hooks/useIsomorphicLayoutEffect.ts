import { useEffect, useLayoutEffect } from 'react'

/**
 * `useLayoutEffect` that does not warn during SSR or in a jsdom test render
 * where the DOM is not yet attached.
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
