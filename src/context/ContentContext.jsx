import { createContext, useContext, useEffect, useState } from 'react'
import * as staticContent from '../data/siteContent'

const ContentContext = createContext(null)

/**
 * Fetches the latest content saved via the admin dashboard (server/content.json,
 * served at /api/content) on mount, so edits made there actually show up on
 * the public site without a rebuild. Falls back to the bundled
 * siteContent.js defaults when no backend is reachable (static hosting,
 * the backend isn't running, or the request fails).
 */
export function ContentProvider({ children }) {
  const [content, setContent] = useState(staticContent)

  useEffect(() => {
    let cancelled = false
    fetch('/api/content')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setContent((prev) => ({ ...prev, ...data }))
        }
      })
      .catch(() => {
        // No backend reachable — keep the bundled defaults.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}

export function useContent(key) {
  const source = useContext(ContentContext) || staticContent
  return source[key]
}
