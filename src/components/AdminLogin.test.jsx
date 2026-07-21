import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AdminProvider } from '../context/AdminContext'
import { AdminLogin } from './AdminLogin'

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AdminProvider>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </AdminProvider>
    </MemoryRouter>
  )
}

describe('AdminLogin', () => {
  beforeEach(() => {
    window.localStorage.removeItem('whitmhack-admin-token')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a password prompt', () => {
    renderLogin()
    expect(screen.getByLabelText(/admin password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('disables submit until a password is typed', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/admin password/i), { target: { value: 'x' } })
    expect(screen.getByRole('button', { name: /log in/i })).toBeEnabled()
  })

  it('shows the server error after a failed login attempt', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Incorrect password.' }) })
    )
    renderLogin()

    fireEvent.change(screen.getByLabelText(/admin password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password.')
    })
  })

  it('does not show an error before the user has submitted', () => {
    renderLogin()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('redirects to the dashboard after a successful login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'abc123' }) })
    )
    renderLogin()

    fireEvent.change(screen.getByLabelText(/admin password/i), { target: { value: 'demo-pass-123' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })
})
