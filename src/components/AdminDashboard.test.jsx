import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AdminProvider } from '../context/AdminContext'
import { AdminDashboard } from './AdminDashboard'
import * as siteContent from '../data/siteContent'

const STORAGE_KEY = 'whitmhack-admin-token'

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <AdminProvider>
        <Routes>
          <Route path="/admin" element={<div>Login Page</div>} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </AdminProvider>
    </MemoryRouter>
  )
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('redirects to the login page when not authenticated', () => {
    renderDashboard()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Edit Content')).not.toBeInTheDocument()
  })

  it('loads and displays content when authenticated', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'abc123')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...siteContent }) })
    )

    renderDashboard()

    expect(await screen.findByText('Edit Content')).toBeInTheDocument()
    const titleDisplay = screen.getByText(siteContent.hero.title)
    fireEvent.click(titleDisplay)
    expect(screen.getByDisplayValue(siteContent.hero.title)).toBeInTheDocument()
  })

  it('saves edited content with the stored bearer token', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'abc123')
    const fetchMock = vi.fn().mockImplementation((url) => {
      if (url === '/api/content') {
        return Promise.resolve({ ok: true, json: async () => ({ ...siteContent }) })
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderDashboard()
    await screen.findByText('Edit Content')

    fireEvent.click(screen.getByText(siteContent.hero.title))
    const titleField = screen.getByDisplayValue(siteContent.hero.title)
    fireEvent.change(titleField, { target: { value: 'WhitmHack Updated' } })
    fireEvent.blur(titleField)

    fireEvent.click(screen.getByRole('button', { name: /save all changes/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/content',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer abc123' }),
          body: expect.stringContaining('WhitmHack Updated'),
        })
      )
    })
    expect(await screen.findByText('Saved successfully!')).toBeInTheDocument()
  })

  it('adds a new organizer card', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'abc123')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...siteContent }) })
    )

    renderDashboard()
    await screen.findByText('Edit Content')

    fireEvent.click(screen.getByRole('button', { name: /^Organizers/ }))
    const before = siteContent.organizersSection.organizers.length
    const removeButtonsBefore = screen.getAllByRole('button', { name: /^Remove /i })
    expect(removeButtonsBefore).toHaveLength(before)

    fireEvent.click(screen.getByRole('button', { name: '+ Add organizer' }))

    expect(screen.getAllByText('New organizer').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /^Remove /i })).toHaveLength(before + 1)
  })

  it('removes an organizer after confirming, and keeps it if the confirmation is cancelled', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'abc123')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...siteContent }) })
    )
    const firstOrganizer = siteContent.organizersSection.organizers[0]

    renderDashboard()
    await screen.findByText('Edit Content')
    fireEvent.click(screen.getByRole('button', { name: /^Organizers/ }))

    vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: `Remove ${firstOrganizer.name}` }))
    expect(screen.getAllByText(firstOrganizer.name).length).toBeGreaterThan(0)

    window.confirm.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: `Remove ${firstOrganizer.name}` }))
    expect(screen.queryByText(firstOrganizer.name)).not.toBeInTheDocument()
  })

  it('supports the same add/remove behavior in a different section (FAQ)', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'abc123')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...siteContent }) })
    )
    const firstQuestion = siteContent.faqSection.questions[0]

    renderDashboard()
    await screen.findByText('Edit Content')
    fireEvent.click(screen.getByRole('button', { name: /^FAQ/ }))

    fireEvent.click(screen.getByRole('button', { name: '+ Add question' }))
    expect(screen.getAllByText('New question').length).toBeGreaterThan(0)

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: `Remove ${firstQuestion.question}` }))
    expect(screen.queryByText(firstQuestion.question)).not.toBeInTheDocument()
  })

  it('includes newly added cards in the saved payload', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'abc123')
    const fetchMock = vi.fn().mockImplementation((url) => {
      if (url === '/api/content') {
        return Promise.resolve({ ok: true, json: async () => ({ ...siteContent }) })
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderDashboard()
    await screen.findByText('Edit Content')
    fireEvent.click(screen.getByRole('button', { name: /^Organizers/ }))
    fireEvent.click(screen.getByRole('button', { name: '+ Add organizer' }))

    fireEvent.click(screen.getByRole('button', { name: /save all changes/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/content',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New organizer'),
        })
      )
    })
  })

  it('edits a footer resource link URL and adds a new one', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'abc123')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...siteContent }) })
    )
    const firstResource = siteContent.footerSection.resources[0]

    renderDashboard()
    await screen.findByText('Edit Content')
    fireEvent.click(screen.getByRole('button', { name: /^Footer/ }))

    fireEvent.click(screen.getByText(firstResource.href))
    const urlField = screen.getByDisplayValue(firstResource.href)
    fireEvent.change(urlField, { target: { value: 'https://example.edu/new-link' } })
    fireEvent.blur(urlField)
    expect(screen.getByText('https://example.edu/new-link')).toBeInTheDocument()

    const linksBefore =
      siteContent.footerSection.resources.length + siteContent.footerSection.social.length
    expect(screen.getAllByRole('button', { name: /^Remove /i })).toHaveLength(linksBefore)

    fireEvent.click(screen.getByRole('button', { name: '+ Add resource link' }))
    expect(screen.getAllByRole('button', { name: /^Remove /i })).toHaveLength(linksBefore + 1)
  })

  it('logs out back to the login route', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'abc123')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...siteContent }) })
    )

    renderDashboard()
    await screen.findByText('Edit Content')

    fireEvent.click(screen.getByRole('button', { name: /log out/i }))

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
