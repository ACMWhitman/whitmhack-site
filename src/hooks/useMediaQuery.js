import { useEffect, useState } from 'react'

/**
 * Tracks whether a CSS media query currently matches, so components can
 * branch on viewport/feature state (e.g. disabling a desktop-only effect
 * below a breakpoint) without reaching for raw window.innerWidth reads
 * that go stale on resize.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return

    const mediaQueryList = window.matchMedia(query)
    const handleChange = (event) => setMatches(event.matches)

    setMatches(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', handleChange)
    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
