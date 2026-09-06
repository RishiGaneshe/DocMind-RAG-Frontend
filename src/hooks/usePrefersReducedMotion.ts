import { useMediaQuery } from './useMediaQuery'

/**
 * True when the OS asks for reduced motion. `<MotionConfig reducedMotion="user">`
 * already covers Motion animations globally (§17); this is for the handful of
 * places that need to skip an effect entirely rather than shorten it — the
 * streaming cursor, the orb backdrop, autoscroll behaviour.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
