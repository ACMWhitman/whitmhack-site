import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AdminProvider, useAdmin } from './AdminContext'

const STORAGE_KEY = 'whitmhack-admin-token'

function Probe() {
  const { isAdmin, token, content, error, loading, login, logout, fetchContent, saveContent } = useAdmin()
  return (
    <div>
      <span data-testid="is-admin">{String(isAdmin)}</span>
      <span data-testid="token">{token || 'none'}</span>
      <span data-testid="error">{error || 'none'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="content">{content ? JSON.stringify(content) : 'none'}</span>
      <button onClick={() => login('secret')}>login</button>
      <button onClick={() => login('wrong')}>login-wrong</button>
      <button onClick={logout}>logout</button>
      <button onClick={fetchContent}>fetch</button>
      <button onClick={() => saveContent({ hero: { title: 'Updated' } })}>save</button>
    </div>
  )
}

function renderProbe() {
  return render(
    <AdminProvider>
      <Probe />
    </AdminProvider>
  )
}

describe('AdminContext', () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts logged out with no token', () => {
    renderProbe()
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false')
    expect(screen.getByTestId('token')).toHaveTextContent('none')
  })

  it('logs in on a successful password, storing the token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'abc123' }) })
    )
    renderProbe()

    fireEvent.click(screen.getByText('login'))

    await waitFor(() => {
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true')
    })
    expect(screen.getByTestId('token')).toHaveTextContent('abc123')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('abc123')
  })

  it('surfaces the server error and stays logged out on a failed password', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Incorrect password.' }) })
    )
    renderProbe()

    fireEvent.click(screen.getByText('login-wrong'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Incorrect password.')
    })
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false')
  })

  it('clears the token and content on logout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'abc123' }) })
    )
    renderProbe()
    fireEvent.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('is-admin')).toHaveTextContent('true'))

    fireEvent.click(screen.getByText('logout'))

    expect(screen.getByTestId('is-admin')).toHaveTextContent('false')
    expect(screen.getByTestId('token')).toHaveTextContent('none')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('fetches public content without requiring a token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ hero: { title: 'Hi' } }) })
    )
    renderProbe()

    fireEvent.click(screen.getByText('fetch'))

    await waitFor(() => {
      expect(screen.getByTestId('content')).toHaveTextContent('Hi')
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/content')
  })

  it('falls back to the bundled defaults when nothing has been saved yet', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => null }))
    renderProbe()

    fireEvent.click(screen.getByText('fetch'))

    await waitFor(() => {
      expect(screen.getByTestId('content')).not.toHaveTextContent('none')
    })
    expect(screen.getByTestId('content')).toHaveTextContent('WhitHack')
  })

  it('refuses to save when not authenticated', async () => {
    renderProbe()
    fireEvent.click(screen.getByText('save'))
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Not authenticated')
    })
  })

  it('sends the bearer token when saving as an authenticated admin', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'abc123', success: true }) })
    vi.stubGlobal('fetch', fetchMock)
    renderProbe()
    fireEvent.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('is-admin')).toHaveTextContent('true'))

    fireEvent.click(screen.getByText('save'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/content',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer abc123' }),
        })
      )
    })
  })
})
