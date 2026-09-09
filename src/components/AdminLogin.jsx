import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

/**
 * A clean, centered password prompt styled with the same design system
 * classes as the public site — no separate admin theme, no jarring
 * visual break when switching between the public site and the admin
 * interface. Shows validation errors inline and disables the submit
 * button while the login request is in flight. Redirects straight to the
 * dashboard once authenticated, rather than leaving the admin staring at
 * an empty password field after a successful login.
 */
export function AdminLogin() {
  const { isAdmin, login, loading, error } = useAdmin()
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (!password.trim()) return
    await login(password.trim())
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-deep-space px-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/15 bg-silicon-blue/80 p-8 backdrop-blur-md">
          <h1 className="font-heading text-electric-wheat text-center text-2xl font-extrabold uppercase tracking-wide">
            Admin Login
          </h1>
          <p className="mt-2 text-center font-body text-sm text-walla-mist/60">
            Enter the admin password to edit site content.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="admin-password" className="sr-only">
                Admin password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full rounded-lg border border-white/20 bg-deep-space/60 px-4 py-3 font-body text-sm text-walla-mist placeholder-walla-mist/40 outline-none transition-colors focus:border-laser-teal focus:ring-1 focus:ring-laser-teal"
              />
            </div>

            {submitted && error && (
              <p className="font-body text-xs text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full rounded-full bg-electric-wheat px-6 py-3 font-subhead text-sm font-bold uppercase tracking-widest text-deep-space transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-body text-xs text-walla-mist/40">
          <a href="/" className="underline-offset-2 hover:text-laser-teal hover:underline">
            &larr; Back to public site
          </a>
        </p>
      </div>
    </div>
  )
}