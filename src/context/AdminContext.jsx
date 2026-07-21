import { createContext, useCallback, useContext, useState } from 'react'

const API_BASE = '/api'
const STORAGE_KEY = 'whitmhack-admin-token'

const AdminContext = createContext(null)

function readStoredToken() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function storeToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(STORAGE_KEY, token)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage unavailable — session just won't persist across reloads.
  }
}

/**
 * Manages admin authentication state and provides helpers for logging in,
 * logging out, and fetching/saving content from the backend API.
 *
 * The token is persisted in localStorage so a page refresh doesn't
 * immediately log the admin out — they stay authenticated until the
 * token expires (2 hours) or they explicitly log out.
 */
export function AdminProvider({ children }) {
  const [token, setToken] = useState(readStoredToken)
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isAdmin = !!token

  const login = useCallback(async (password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }
      storeToken(data.token)
      setToken(data.token)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    storeToken(null)
    setToken(null)
    setContent(null)
    setError(null)
  }, [])

  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/content`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch content')
      }
      setContent(data)
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const saveContent = useCallback(async (newContent) => {
    if (!token) {
      setError('Not authenticated')
      return false
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newContent),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save content')
      }
      setContent(newContent)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [token])

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        token,
        content,
        loading,
        error,
        login,
        logout,
        fetchContent,
        saveContent,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}