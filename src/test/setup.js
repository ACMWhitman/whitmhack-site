import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement IntersectionObserver or matchMedia, but our
// scroll-driven animations (Framer Motion's useInView/useScroll) and
// prefers-reduced-motion checks depend on them. Stub both so component
// tests can run headlessly in CI without touching a real browser.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = MockIntersectionObserver
}

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Newer Node versions ship an experimental global `localStorage` that
// shadows jsdom's full implementation with a bare, mostly-nonfunctional
// stub (missing removeItem/clear) unless a --localstorage-file is
// configured. Replace it with a simple, real in-memory implementation so
// tests behave the same regardless of Node version.
class MemoryStorage {
  #store = new Map()
  getItem(key) {
    return this.#store.has(key) ? this.#store.get(key) : null
  }
  setItem(key, value) {
    this.#store.set(key, String(value))
  }
  removeItem(key) {
    this.#store.delete(key)
  }
  clear() {
    this.#store.clear()
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new MemoryStorage(),
  writable: true,
  configurable: true,
})
