import { describe, it, expect, vi, afterEach } from 'vitest'

function createMockContext(state) {
  const oscillator = {
    type: '',
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }
  const gain = {
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  }
  const noiseSource = {
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }
  const filter = {
    type: '',
    Q: { value: 0 },
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  }
  const noiseBuffer = { getChannelData: vi.fn(() => new Float32Array(4)) }
  const mockContext = {
    state,
    currentTime: 0,
    sampleRate: 44100,
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gain),
    createBufferSource: vi.fn(() => noiseSource),
    createBiquadFilter: vi.fn(() => filter),
    createBuffer: vi.fn(() => noiseBuffer),
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
  }
  return { mockContext, oscillator, gain, noiseSource, filter }
}

function stubAudioContext(state) {
  const { mockContext, oscillator, gain, noiseSource, filter } = createMockContext(state)
  class MockAudioContext {
    constructor() {
      return mockContext
    }
  }
  vi.stubGlobal('AudioContext', MockAudioContext)
  return { mockContext, oscillator, gain, noiseSource, filter }
}

describe('uiSounds', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('does not throw when the environment has no Web Audio API support', async () => {
    // jsdom (our test environment) doesn't implement AudioContext, which
    // is exactly the "unsupported browser" case this should degrade
    // gracefully for.
    const {
      playClickSound,
      playNavSound,
      playOpenSound,
      playCloseSound,
      playToggleOnSound,
      playToggleOffSound,
      playKeystrokeSound,
      playSplashSound,
      playTiltSound,
      playGlitchSound,
    } = await import('./uiSounds')
    expect(() => playClickSound()).not.toThrow()
    expect(() => playNavSound()).not.toThrow()
    expect(() => playOpenSound()).not.toThrow()
    expect(() => playCloseSound()).not.toThrow()
    expect(() => playToggleOnSound()).not.toThrow()
    expect(() => playToggleOffSound()).not.toThrow()
    expect(() => playKeystrokeSound()).not.toThrow()
    expect(() => playSplashSound()).not.toThrow()
    expect(() => playTiltSound()).not.toThrow()
    expect(() => playGlitchSound()).not.toThrow()
  })

  it('creates and starts an oscillator immediately when the context is already running', async () => {
    const { mockContext, oscillator, gain } = stubAudioContext('running')

    const { playClickSound } = await import('./uiSounds')
    playClickSound({ volume: 0.1 })

    expect(mockContext.createOscillator).toHaveBeenCalled()
    expect(oscillator.connect).toHaveBeenCalledWith(gain)
    expect(gain.connect).toHaveBeenCalledWith(mockContext.destination)
    expect(oscillator.start).toHaveBeenCalled()
    expect(oscillator.stop).toHaveBeenCalled()
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0.1, 0)
  })

  it('waits for a suspended context to resume before scheduling the tone', async () => {
    const { mockContext } = stubAudioContext('suspended')

    const { playClickSound } = await import('./uiSounds')
    playClickSound()

    // Right after calling, resume() has been requested but the oscillator
    // must not have been scheduled yet — that would mean we're using a
    // currentTime from a context that isn't actually running.
    expect(mockContext.resume).toHaveBeenCalled()
    expect(mockContext.createOscillator).not.toHaveBeenCalled()

    // Let the resume() promise resolve.
    await Promise.resolve()
    await Promise.resolve()

    expect(mockContext.createOscillator).toHaveBeenCalled()
  })

  it('gives the open and close sounds mirrored, reversed frequency sweeps', async () => {
    const { oscillator } = stubAudioContext('running')

    const { playOpenSound, playCloseSound } = await import('./uiSounds')
    playOpenSound()
    const [openStart, openStartTime] = oscillator.frequency.setValueAtTime.mock.calls[0]
    const [openEnd] = oscillator.frequency.exponentialRampToValueAtTime.mock.calls[0]

    playCloseSound()
    const [closeStart] = oscillator.frequency.setValueAtTime.mock.calls[1]
    const [closeEnd] = oscillator.frequency.exponentialRampToValueAtTime.mock.calls[1]

    expect(openStartTime).toBe(0)
    expect(openStart).toBe(closeEnd)
    expect(openEnd).toBe(closeStart)
  })

  it('gives the toggle-on and toggle-off sounds different directions', async () => {
    const { oscillator } = stubAudioContext('running')

    const { playToggleOnSound, playToggleOffSound } = await import('./uiSounds')
    playToggleOnSound()
    const [onStart] = oscillator.frequency.setValueAtTime.mock.calls[0]
    const [onEnd] = oscillator.frequency.exponentialRampToValueAtTime.mock.calls[0]

    playToggleOffSound()
    const [offStart] = oscillator.frequency.setValueAtTime.mock.calls[1]
    const [offEnd] = oscillator.frequency.exponentialRampToValueAtTime.mock.calls[1]

    expect(onStart).toBeLessThan(onEnd) // rises
    expect(offStart).toBeGreaterThan(offEnd) // falls
  })

  it('plays the splash sound as an oscillator sweep, waiting for a suspended context to resume', async () => {
    const { mockContext, oscillator } = stubAudioContext('suspended')

    const { playSplashSound } = await import('./uiSounds')
    playSplashSound()

    expect(mockContext.resume).toHaveBeenCalled()
    expect(mockContext.createOscillator).not.toHaveBeenCalled()

    await Promise.resolve()
    await Promise.resolve()

    expect(mockContext.createOscillator).toHaveBeenCalled()
    expect(oscillator.start).toHaveBeenCalled()
  })

  it('plays the tilt whoosh as a filtered noise burst', async () => {
    const { mockContext, noiseSource, filter } = stubAudioContext('running')

    const { playTiltSound } = await import('./uiSounds')
    playTiltSound()

    expect(mockContext.createBufferSource).toHaveBeenCalled()
    expect(mockContext.createBiquadFilter).toHaveBeenCalled()
    expect(filter.type).toBe('bandpass')
    expect(noiseSource.connect).toHaveBeenCalledWith(filter)
    expect(noiseSource.start).toHaveBeenCalled()
  })

  it('plays the glitch sound as a noise burst layered with randomized square blips', async () => {
    const { mockContext, filter, oscillator } = stubAudioContext('running')

    const { playGlitchSound } = await import('./uiSounds')
    playGlitchSound()

    expect(mockContext.createBufferSource).toHaveBeenCalled()
    expect(filter.type).toBe('highpass')
    // Three randomized square blips are layered on top of the noise burst.
    expect(mockContext.createOscillator).toHaveBeenCalledTimes(3)
    expect(oscillator.type).toBe('square')
  })

  it('waits for a suspended context before scheduling the tilt and glitch noise bursts', async () => {
    const { mockContext } = stubAudioContext('suspended')

    const { playTiltSound } = await import('./uiSounds')
    playTiltSound()

    expect(mockContext.resume).toHaveBeenCalled()
    expect(mockContext.createBufferSource).not.toHaveBeenCalled()

    await Promise.resolve()
    await Promise.resolve()

    expect(mockContext.createBufferSource).toHaveBeenCalled()
  })
})
