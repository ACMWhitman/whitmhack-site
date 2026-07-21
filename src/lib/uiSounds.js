let sharedAudioContext = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass()
  }
  return sharedAudioContext
}

function scheduleTone(ctx, { type, startFreq, endFreq, duration, volume }) {
  const now = ctx.currentTime
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(startFreq, now)
  oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration)

  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration)
}

/**
 * Synthesizes a short tone using the Web Audio API instead of shipping
 * .mp3 assets — no extra network requests, and every sound in this file
 * is just a frequency sweep + volume decay described as plain numbers.
 * Silently no-ops in any environment without Web Audio support (older
 * browsers, jsdom in tests) rather than throwing, since a missing UI
 * sound should never break the interaction it's attached to.
 */
function playTone(options) {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    // A freshly created AudioContext starts suspended until a user
    // gesture resumes it, and resume() is async. Scheduling the tone
    // immediately (using a currentTime from a context that hasn't
    // actually started yet) silently produces no sound — the tone must
    // wait for the resume to actually finish.
    ctx.resume().then(() => scheduleTone(ctx, options))
    return
  }

  scheduleTone(ctx, options)
}

// Generates one buffer of white noise — the raw material for the
// "texture" sounds below (splash, tilt whoosh, glitch static) that a
// clean oscillator sweep can't read as. Built fresh per call rather than
// cached since these bursts are short and infrequent (hover-triggered).
function createNoiseBuffer(ctx, duration) {
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frameCount; i += 1) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

function scheduleNoiseBurst(ctx, { duration, volume, filterType, filterFreq, filterFreqEnd, Q = 1 }) {
  const now = ctx.currentTime
  const source = ctx.createBufferSource()
  source.buffer = createNoiseBuffer(ctx, duration)

  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.Q.value = Q
  filter.frequency.setValueAtTime(filterFreq, now)
  if (filterFreqEnd) {
    filter.frequency.exponentialRampToValueAtTime(filterFreqEnd, now + duration)
  }

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  source.start(now)
  source.stop(now + duration)
}

function playNoiseBurst(options) {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => scheduleNoiseBurst(ctx, options))
    return
  }

  scheduleNoiseBurst(ctx, options)
}

// A short, crisp click for primary actions (the hero/footer register CTA).
export function playClickSound({ volume = 0.05 } = {}) {
  playTone({ type: 'square', startFreq: 880, endFreq: 220, duration: 0.06, volume })
}

// A quick upward blip for the section-nav links — quieter and shorter
// than the primary click since it fires on ordinary navigation, not a
// one-off commitment like registering.
export function playNavSound({ volume = 0.04 } = {}) {
  playTone({ type: 'sine', startFreq: 520, endFreq: 640, duration: 0.035, volume })
}

// Rising pitch reads as "opening" (an accordion/FAQ answer expanding);
// the matching playCloseSound below is the same sweep in reverse, so the
// two always sound like inverses of each other rather than unrelated
// effects.
export function playOpenSound({ volume = 0.05 } = {}) {
  playTone({ type: 'sine', startFreq: 320, endFreq: 640, duration: 0.05, volume })
}

export function playCloseSound({ volume = 0.05 } = {}) {
  playTone({ type: 'sine', startFreq: 640, endFreq: 320, duration: 0.05, volume })
}

// The sound toggle itself needs its own distinct pair — triangle wave
// (softer than the click's square wave) sweeping up for "on" and down
// for "off", so flipping the switch is confirmed by ear even though
// every other sound in the app is currently gated on that same switch.
export function playToggleOnSound({ volume = 0.06 } = {}) {
  playTone({ type: 'triangle', startFreq: 440, endFreq: 880, duration: 0.08, volume })
}

export function playToggleOffSound({ volume = 0.06 } = {}) {
  playTone({ type: 'triangle', startFreq: 660, endFreq: 330, duration: 0.08, volume })
}

// A near-silent, high-pitched tick — one per character the hero
// typewriter reveals (typing or deleting). Deliberately quiet since it
// repeats every ~45ms while a phrase is mid-word; a small random pitch
// jitter keeps a whole word from sounding like one mechanical loop.
export function playKeystrokeSound({ volume = 0.018 } = {}) {
  const freq = 1500 + Math.random() * 600
  playTone({ type: 'square', startFreq: freq, endFreq: freq * 0.75, duration: 0.02, volume })
}

function scheduleSplash(ctx, volume) {
  const now = ctx.currentTime
  // The "drop": a fast downward sweep landing low...
  scheduleTone(ctx, { type: 'sine', startFreq: 520, endFreq: 130, duration: 0.14, volume })
  // ...then the "ripple": a short, quieter upward blip a beat later, the
  // way an actual splash bounces back up right after it lands.
  const bounce = ctx.createOscillator()
  const bounceGain = ctx.createGain()
  bounce.type = 'sine'
  bounce.frequency.setValueAtTime(240, now + 0.09)
  bounce.frequency.exponentialRampToValueAtTime(360, now + 0.17)
  bounceGain.gain.setValueAtTime(0.0001, now)
  bounceGain.gain.setValueAtTime(volume * 0.5, now + 0.09)
  bounceGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19)
  bounce.connect(bounceGain)
  bounceGain.connect(ctx.destination)
  bounce.start(now + 0.09)
  bounce.stop(now + 0.19)
}

// A two-part "droplet" for the liquid-avatar hover — matches the WebGL
// ripple shader's own shape (an initial disturbance that falls, then
// bounces back toward rest) rather than a generic UI blip.
export function playSplashSound({ volume = 0.05 } = {}) {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => scheduleSplash(ctx, volume))
    return
  }
  scheduleSplash(ctx, volume)
}

// A soft filtered-noise "swish" sweeping low-to-high — reads as physical
// motion (a card leaning toward the cursor) rather than a UI beep, for
// the About section's 3D bento-card tilt.
export function playTiltSound({ volume = 0.035 } = {}) {
  playNoiseBurst({
    duration: 0.18,
    volume,
    filterType: 'bandpass',
    filterFreq: 300,
    filterFreqEnd: 1800,
    Q: 0.8,
  })
}

function scheduleGlitch(ctx, volume) {
  scheduleNoiseBurst(ctx, {
    duration: 0.09,
    volume,
    filterType: 'highpass',
    filterFreq: 1200,
    filterFreqEnd: 4000,
    Q: 5,
  })
  // A couple of stray, randomly-pitched square blips layered on top of
  // the static burst — the "signal breaking up" texture that matches the
  // CSS glitch-slice effect it's paired with (Register CTA / track cards).
  for (let i = 0; i < 3; i += 1) {
    const freq = 700 + Math.random() * 2600
    scheduleTone(ctx, { type: 'square', startFreq: freq, endFreq: freq * 0.5, duration: 0.02, volume: volume * 0.6 })
  }
}

export function playGlitchSound({ volume = 0.04 } = {}) {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => scheduleGlitch(ctx, volume))
    return
  }
  scheduleGlitch(ctx, volume)
}
