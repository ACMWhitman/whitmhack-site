import { useEffect, useRef } from 'react'
import { getInitials } from '../lib/initials'
import { lerp } from '../lib/lerp'
import { createProgram } from '../lib/webgl'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useSound } from '../context/SoundContext'

const AVATAR_SIZE = 160

// Flat brand placeholder backgrounds for the team "photos" — alternating
// Whitman Yellow and white circles (the only non-navy hues in the
// three-color system). Initials always render in navy on both so they stay
// legible.
const ACCENT_COLORS = ['#FFC627', '#FFFFFF', '#FFC627', '#FFFFFF']

function accentColor(accentIndex) {
  return ACCENT_COLORS[accentIndex % ACCENT_COLORS.length]
}

function initialsFill() {
  return '#010E30'
}

const VERTEX_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

// Samples the placeholder-photo texture with its UVs pushed outward from
// the cursor by a decaying sine wave — a cheap, per-pixel "liquid ripple"
// that only costs a few extra instructions per fragment, well within a
// 60fps budget even on modest mobile GPUs since the canvas itself is small
// (AVATAR_SIZE px) rather than full-viewport.
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
    float falloff = smoothstep(0.55, 0.0, dist);
    float ripple = wave * 0.025 * u_strength * falloff;
    gl_FragColor = texture2D(u_texture, v_uv + dir * ripple);
  }
`

const QUAD_VERTICES = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])

function createPlaceholderTexture(name, accentIndex) {
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE
  const ctx = canvas.getContext('2d')

  const accent = accentColor(accentIndex)
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE)

  ctx.fillStyle = initialsFill()
  ctx.font = `700 ${AVATAR_SIZE * 0.3}px "Lora", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(getInitials(name), AVATAR_SIZE / 2, AVATAR_SIZE / 2)

  return canvas
}

function StaticAvatar({ name, accentIndex }) {
  const accent = accentColor(accentIndex)
  return (
    <div
      role="img"
      aria-label={`Photo of ${name}`}
      data-testid="liquid-avatar-static"
      className="flex h-40 w-40 items-center justify-center rounded-full font-heading text-3xl font-bold text-deep-space"
      style={{ backgroundColor: accent }}
    >
      {getInitials(name)}
    </div>
  )
}

/**
 * A team-member "photo" (a procedurally generated placeholder — flat brand
 * color + initials — until real headshots exist) that ripples like liquid
 * around the cursor on hover, built with a hand-written WebGL shader
 * instead of a 3D library. There's no actual 3D scene here, just a
 * full-quad fragment shader distorting a texture, so it doesn't need
 * Three.js's overhead (see MatrixRain.jsx / README for the earlier
 * decision to drop Three.js from this project entirely).
 */
export function LiquidAvatar({ name, accentIndex = 0 }) {
  const canvasRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const { playSplash } = useSound()
  // Read through a ref inside the WebGL effect below rather than listing
  // `playSplash` in its dependency array — that effect tears down and
  // rebuilds the whole GL program/buffers/texture, and the sound toggle
  // flipping shouldn't cost a full re-init of the shader.
  const playSplashRef = useRef(playSplash)
  useEffect(() => {
    playSplashRef.current = playSplash
  }, [playSplash])

  useEffect(() => {
    if (prefersReducedMotion) return
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl')
    // jsdom (tests) and any browser without WebGL support return null
    // here — degrade to nothing rendered rather than crashing; the
    // reduced-motion branch already covers the "no fancy effect" case
    // visually, so a bare canvas with no draw calls is an acceptable
    // fallback for the rare no-WebGL browser.
    if (!gl) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = AVATAR_SIZE * dpr
    canvas.height = AVATAR_SIZE * dpr
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
      createPlaceholderTexture(name, accentIndex)
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const mouseLoc = gl.getUniformLocation(program, 'u_mouse')
    const strengthLoc = gl.getUniformLocation(program, 'u_strength')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0)

    let currentStrength = 0
    let targetStrength = 0
    let mouse = { x: 0.5, y: 0.5 }
    let rafId

    const render = (time) => {
      currentStrength = lerp(currentStrength, targetStrength, 0.1)
      gl.uniform2f(mouseLoc, mouse.x, mouse.y)
      gl.uniform1f(strengthLoc, currentStrength)
      gl.uniform1f(timeLoc, time * 0.001)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafId = requestAnimationFrame(render)
    }
    rafId = requestAnimationFrame(render)

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      mouse = {
        x: (event.clientX - rect.left) / rect.width,
        y: 1 - (event.clientY - rect.top) / rect.height,
      }
    }
    const handlePointerEnter = () => {
      targetStrength = 1
      playSplashRef.current()
    }
    const handlePointerLeave = () => {
      targetStrength = 0
    }

    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerenter', handlePointerEnter)
    canvas.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      cancelAnimationFrame(rafId)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerenter', handlePointerEnter)
      canvas.removeEventListener('pointerleave', handlePointerLeave)
      gl.deleteProgram(program)
      gl.deleteBuffer(positionBuffer)
      gl.deleteTexture(texture)
    }
  }, [prefersReducedMotion, name, accentIndex])

  if (prefersReducedMotion) {
    return <StaticAvatar name={name} accentIndex={accentIndex} />
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Photo of ${name}`}
      data-testid="liquid-avatar-canvas"
      className="h-40 w-40 rounded-full"
    />
  )
}
