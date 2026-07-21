import { useEffect, useRef } from 'react'
import { lerp } from '../lib/lerp'
import { createProgram } from '../lib/webgl'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const VERTEX_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

// Same per-pixel liquid-ripple math as LiquidAvatar.jsx, reused as-is —
// the only difference is `u_mouse` is pinned to the center instead of
// following the cursor, so the ripple reads as "settling into place"
// rather than "reacting to a hover."
const FRAGMENT_SOURCE = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform float u_strength;
  uniform float u_time;

  void main() {
    vec2 toMouse = v_uv - u_mouse;
    float dist = length(toMouse);
    vec2 dir = toMouse / max(dist, 0.0001);
    float wave = sin(dist * 25.0 - u_time * 4.0);
    float falloff = smoothstep(0.7, 0.0, dist);
    float ripple = wave * 0.035 * u_strength * falloff;
    gl_FragColor = texture2D(u_texture, v_uv + dir * ripple);
  }
`

const QUAD_VERTICES = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
const SETTLE_EPSILON = 0.001
// Roughly 2.7x slower to settle than the first version (was 0.06) — a
// lower per-frame lerp factor means each step closes a smaller fraction
// of the remaining distance, so it just takes more frames/time overall.
const SETTLE_LERP_FACTOR = 0.022
// The WebGL framebuffer (and the texture drawn onto it) are rendered at
// this multiple of the real devicePixelRatio, then the browser downsamples
// that oversized canvas back down to its actual CSS box size on paint —
// free anti-aliasing, since a bigger source image scaled down looks
// smoother than a 1:1 render, especially on fine text edges.
const TEXTURE_SUPERSAMPLE = 2

function resolveFillStyle(ctx, colors, x0, y0, x1, y1) {
  if (colors.length === 1) return colors[0]
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  colors.forEach((stopColor, i) => gradient.addColorStop(i / (colors.length - 1), stopColor))
  return gradient
}

// A small filled dot — drawn with a plain canvas arc so it can live in the
// same texture as the text next to it and ripple as one piece, instead of
// needing a second WebGL canvas/shader instance.
function drawDotIcon(ctx, centerX, centerY, size, accentColor) {
  const radius = size / 2
  ctx.save()
  // A tight, low glow — enough to read as "lit up" without turning into a
  // soft blob, which is exactly the kind of blur the text next to it is
  // being kept clear of.
  ctx.shadowColor = accentColor
  ctx.shadowBlur = size * 0.1
  ctx.fillStyle = accentColor
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// Drawn at the *same* pixel density as the WebGL framebuffer (both scaled
// by the same factor) so the texture never has to be magnified back up by
// the LINEAR filter below — a lower-res texture stretched to fill a
// higher-res framebuffer is exactly what makes small text look
// permanently soft/doubled, indistinguishable from an unsettled ripple.
function createTextTexture(text, { width, height, fontSize, fontFamily, colors, scale, icon, iconSize, iconColor }) {
  const canvas = document.createElement('canvas')
  const w = width * scale
  const h = height * scale
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  ctx.font = `${fontSize * scale}px ${fontFamily}`
  ctx.textBaseline = 'middle'
  const textWidth = ctx.measureText(text).width

  // Left-aligned at the same small margin regardless of whether there's an
  // icon above — this is what keeps "Menu"/"Close" flush with "Home",
  // "About", etc. instead of centered in its own, wider canvas.
  ctx.textAlign = 'left'
  const textX = 2 * scale

  let textY
  if (icon) {
    // `iconSize` is its own independent knob (not derived from fontSize)
    // so the two can be resized separately.
    const iconSizeScaled = iconSize * scale
    const iconMargin = iconSizeScaled * 0.22
    const iconCenterY = iconSizeScaled / 2 + iconMargin + 4 * scale
    // The icon's own left edge lines up with the text's left edge (not
    // centered over the whole canvas), so the icon+text pair reads as one
    // left-anchored column.
    const iconCenterX = textX + iconSizeScaled / 2
    drawDotIcon(ctx, iconCenterX, iconCenterY, iconSizeScaled, iconColor || colors[colors.length - 1])
    textY = iconCenterY + iconSizeScaled / 2 + iconMargin + fontSize * scale * 0.35 + (fontSize * scale) / 2
  } else {
    textY = h / 2
  }

  const gradientX0 = textX
  const gradientX1 = textX + textWidth
  ctx.fillStyle = resolveFillStyle(ctx, colors, gradientX0, textY, gradientX1, textY)
  ctx.fillText(text, textX, textY)

  return canvas
}

/**
 * Renders `text` (optionally with a small procedural dot icon above it)
 * as a WebGL-distorted texture that starts fully "rippled" and settles
 * into crisp, still text — the same liquid-distortion shader as
 * LiquidAvatar.jsx's team-photo hover effect, adapted so the ripple is
 * centered and time-triggered instead of cursor-following. Two ways to
 * trigger a ripple:
 *
 * - On mount, after `revealDelayMs` — used to stagger a list of these so
 *   they emerge one after another instead of all at once.
 * - Whenever `rippleSignal` changes (any new value counts, not just an
 *   increment) — used for a persistent label (like a "Menu" trigger) that
 *   needs to visibly ripple again on every click without unmounting.
 *
 * `colors` is an array: one entry renders as a flat fill, two or more
 * render as a left-to-right linear gradient across the text. `iconColor`
 * is independent of `colors` — the dot doesn't have to match the text
 * gradient's colors, and defaults to the last one if not given.
 *
 * Falls back to plain, instantly-visible text under `prefers-reduced-motion`.
 */
export function RippleText({
  text,
  width = 240,
  height = 48,
  fontSize = 28,
  fontFamily = "'Times New Roman', Times, serif",
  colors = ['#EFF2F9'],
  icon = false,
  iconSize = 20,
  iconColor = null,
  revealDelayMs = 0,
  rippleSignal = 0,
  className,
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const canvasRef = useRef(null)
  const loopControlRef = useRef(null)
  const isFirstRippleSignal = useRef(true)

  useEffect(() => {
    if (prefersReducedMotion) return
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl')
    // jsdom (tests) and any browser without WebGL return null here —
    // degrade to nothing rendered, same as LiquidAvatar.jsx.
    if (!gl) return

    // Unlike LiquidAvatar's photo effect (which caps devicePixelRatio for
    // performance, since a soft gradient tolerates it fine), fine text
    // needs the real pixel density — plus a supersample multiplier on top
    // of that — or it reads as permanently soft on high-DPI screens.
    const scale = (window.devicePixelRatio || 1) * TEXTURE_SUPERSAMPLE
    canvas.width = width * scale
    canvas.height = height * scale
    gl.viewport(0, 0, canvas.width, canvas.height)

    let program
    try {
      program = createProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE)
    } catch {
      return
    }
    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW)
    const positionLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      createTextTexture(text, { width, height, fontSize, fontFamily, colors, scale, icon, iconSize, iconColor })
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const strengthLoc = gl.getUniformLocation(program, 'u_strength')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), 0.5, 0.5)
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0)

    const state = { current: 1, target: 0 }
    let rafId = null

    const renderFrame = (time) => {
      gl.uniform1f(strengthLoc, state.current)
      gl.uniform1f(timeLoc, time * 0.001)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const tick = (time) => {
      state.current = lerp(state.current, state.target, SETTLE_LERP_FACTOR)
      renderFrame(time)
      rafId = Math.abs(state.current - state.target) > SETTLE_EPSILON ? requestAnimationFrame(tick) : null
    }

    const startSettling = () => {
      state.current = 1
      state.target = 0
      if (rafId === null) rafId = requestAnimationFrame(tick)
    }

    // Paint one fully-rippled frame right away so there's no blank flash
    // while `revealDelayMs` (the stagger) elapses, then start the actual
    // settle animation once the delay is up.
    renderFrame(performance.now())
    const revealTimeoutId = window.setTimeout(startSettling, revealDelayMs)

    loopControlRef.current = { startSettling }

    return () => {
      window.clearTimeout(revealTimeoutId)
      if (rafId !== null) cancelAnimationFrame(rafId)
      gl.deleteProgram(program)
      gl.deleteBuffer(positionBuffer)
      gl.deleteTexture(texture)
    }
  }, [prefersReducedMotion, text, width, height, fontSize, fontFamily, colors, icon, iconSize, iconColor, revealDelayMs])

  // A later ripple, independent of the mount-time reveal above — for a
  // persistent trigger label that needs to ripple again on every click.
  useEffect(() => {
    if (isFirstRippleSignal.current) {
      isFirstRippleSignal.current = false
      return
    }
    loopControlRef.current?.startSettling()
  }, [rippleSignal])

  if (prefersReducedMotion) {
    const gradientStyle =
      colors.length === 1
        ? { color: colors[0] }
        : {
            backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }
    return (
      <span aria-hidden="true" className={className} style={{ ...gradientStyle, fontSize }}>
        {text}
      </span>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="ripple-text-canvas"
      className={className}
      style={{ width, height }}
    />
  )
}
