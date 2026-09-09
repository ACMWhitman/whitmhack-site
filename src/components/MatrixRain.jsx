import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const FONT_SIZE = 16
const GLYPHS = '01'
const FRAME_INTERVAL_MS = 60
const TRAIL_FADE_ALPHA = 0.08
const RAIN_COLOR_RGB = '255, 198, 39' // electric-wheat (Whitman Yellow #FFC627)
const BACKGROUND_RGB = '1, 14, 48' // deep-space (Whitman Navy #010E30)

// Each stream flashes brighter the instant it spawns at the top, then
// cools down to the settled, barely-there baseline it falls at for the
// rest of its run — a little spark of "just appeared" before blending
// into the ambient texture.
const HEAD_ALPHA_MIN = 0.6
const HEAD_ALPHA_MAX = 0.7
const SETTLED_ALPHA = 0.32
const ALPHA_DECAY = 0.94

/**
 * Classic "digital rain" background: columns of falling 0/1 characters,
 * drawn on a plain 2D canvas (no WebGL, no external image/video assets).
 * The canvas element's CSS opacity is tuned to be clearly visible as a
 * genuine texture (not just a hint of one) while still staying behind the
 * hero content — the real foreground text sits in its own opaque layer on
 * top and is verified against this background via an automated contrast
 * audit (see e2e/accessibility.spec.js), not by guesswork.
 */
export function MatrixRain() {
  const canvasRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    // jsdom (our test environment) has no real 2D canvas implementation
    // and returns null here — bail out quietly rather than crashing.
    if (!ctx) return

    let columnCount = 0
    let drops = []
    let alphas = []

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
      columnCount = Math.max(1, Math.floor(width / FONT_SIZE))
      drops = Array.from({ length: columnCount }, () =>
        Math.floor((Math.random() * height) / FONT_SIZE)
      )
      alphas = Array.from(
        { length: columnCount },
        () => HEAD_ALPHA_MIN + Math.random() * (HEAD_ALPHA_MAX - HEAD_ALPHA_MIN)
      )
    }
    resize()
    window.addEventListener('resize', resize)

    const intervalId = window.setInterval(() => {
      // A translucent rectangle over the whole canvas, drawn every frame
      // instead of a hard clear, is what leaves the fading trail behind
      // each falling character.
      ctx.fillStyle = `rgba(${BACKGROUND_RGB}, ${TRAIL_FADE_ALPHA})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${FONT_SIZE}px monospace`
      for (let column = 0; column < columnCount; column++) {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        const x = column * FONT_SIZE
        const y = drops[column] * FONT_SIZE

        ctx.fillStyle = `rgba(${RAIN_COLOR_RGB}, ${alphas[column]})`
        ctx.fillText(glyph, x, y)
        // Cool down toward the settled baseline every frame, so the bright
        // spawn flash only lasts the first second or so of a stream's fall.
        alphas[column] = Math.max(SETTLED_ALPHA, alphas[column] * ALPHA_DECAY)

        const pastBottom = y > canvas.height
        if (pastBottom && Math.random() > 0.975) {
          drops[column] = 0
          alphas[column] = HEAD_ALPHA_MIN + Math.random() * (HEAD_ALPHA_MAX - HEAD_ALPHA_MIN)
        } else {
          drops[column] += 1
        }
      }
    }, FRAME_INTERVAL_MS)

    return () => {
      window.removeEventListener('resize', resize)
      window.clearInterval(intervalId)
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        data-testid="matrix-rain-static"
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(255,198,39,0.8) 0px, rgba(255,198,39,0.8) 1px, transparent 1px, transparent 18px)',
        }}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="matrix-rain-canvas"
      className="absolute inset-0 h-full w-full opacity-[0.14]"
    />
  )
}
