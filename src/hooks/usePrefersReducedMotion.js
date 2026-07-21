import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Tracks the user's OS-level "reduce motion" preference so animated
 * components can swap in a static/simplified fallback.
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia(QUERY).matches
      : false
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return

    const mediaQueryList = window.matchMedia(QUERY)
    const handleChange = (event) => setPrefersReducedMotion(event.matches)

    mediaQueryList.addEventListener('change', handleChange)
    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}
