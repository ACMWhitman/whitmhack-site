import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ContentProvider, useContent } from './ContentContext'
import { hero as staticHero } from '../data/siteContent'

function Probe({ contentKey, field }) {
  const value = useContent(contentKey)
  return <span data-testid="probe">{value?.[field]}</span>
}

describe('ContentContext', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('falls back to the bundled siteContent.js default when used outside a provider', () => {
    render(<Probe contentKey="hero" field="title" />)
    expect(screen.getByTestId('probe')).toHaveTextContent(staticHero.title)
  })

  it('renders bundled defaults immediately, then swaps in fetched content once /api/content resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ hero: { ...staticHero, title: 'Live Title From Server' } }),
      })
    )

    render(
      <ContentProvider>
        <Probe contentKey="hero" field="title" />
      </ContentProvider>
    )

    expect(screen.getByTestId('probe')).toHaveTextContent(staticHero.title)

    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveTextContent('Live Title From Server')
    })
  })

  it('keeps the bundled defaults when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

    render(
      <ContentProvider>
        <Probe contentKey="hero" field="title" />
      </ContentProvider>
    )

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/content')
    })
    expect(screen.getByTestId('probe')).toHaveTextContent(staticHero.title)
  })

  it('keeps the bundled defaults when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    render(
      <ContentProvider>
        <Probe contentKey="hero" field="title" />
      </ContentProvider>
    )

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    expect(screen.getByTestId('probe')).toHaveTextContent(staticHero.title)
  })
})
