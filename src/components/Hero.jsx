import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CountdownClock } from './CountdownClock'
import { MatrixRain } from './MatrixRain'
import { GlitchText } from './GlitchText'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'

// The wordmark rests in its fully "bulged" state (heavy italic + stepped
// shadow). The closer the cursor gets within this radius (px) of the
// logo's center, the more it shrinks back toward light/upright and no
// shadow.
const PROXIMITY_RANGE = 320

export function Hero() {
  const hero = useContent('hero')
  const prefersReducedMotion = usePrefersReducedMotion()
  const { playClick, playGlitch } = useSound()
  const [isCtaGlitching, setIsCtaGlitching] = useState(false)
  const headlineRef = useRef(null)

  const startGlitch = () => {
    setIsCtaGlitching(true)
    playGlitch()
  }

  // Reverse-proximity: at rest the headline shows its full bulged state
  // (heavy italic + offset shadow, default CSS). As the cursor nears the
  // logo over ~PROXIMITY_RANGE px, it shrinks — thinning to regular upright
  // and pulling the shadow away. Driven directly on the DOM per pointermove.
  useEffect(() => {
    if (prefersReducedMotion) return
    const headline = headlineRef.current
    if (!headline) return

    const applyProximity = (clientX, clientY) => {
      const rect = headline.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.hypot(clientX - centerX, clientY - centerY)
      const shrink = Math.max(0, Math.min(1, 1 - distance / PROXIMITY_RANGE))
      const far = 1 - shrink

      const weight = Math.round(700 - 300 * shrink)
      const italic = far.toFixed(3)
      const scale = 1 - 0.05 * shrink
      const textShadow =
        far < 0.01
          ? 'none'
          : `${2 * far}px ${2 * far}px 0 rgba(255, 255, 255, ${0.85 * far}),
              ${4 * far}px ${4 * far}px 0 rgba(255, 255, 255, ${0.55 * far}),
              ${7 * far}px ${7 * far}px 0 rgba(255, 255, 255, ${0.28 * far})`

      for (const span of headline.querySelectorAll('.hero-vf')) {
        span.style.fontVariationSettings = `'wght' ${weight}, 'ital' ${italic}`
        span.style.textShadow = textShadow
        span.style.transform = `scale(${scale.toFixed(4)})`
      }
    }

    const offscreen = () => applyProximity(-9999, -9999)
    const handleMove = (event) => applyProximity(event.clientX, event.clientY)

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerleave', offscreen)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerleave', offscreen)
    }
  }, [prefersReducedMotion])

  return (
    <section
      id="hero"
      aria-label="WhitHack hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 text-center supports-[min-height:100svh]:min-h-svh"
    >
      <MatrixRain />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-3xl flex-col items-center gap-6"
      >
        <p className="font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal sm:text-sm">
          {hero.context}
        </p>

        <h1
          ref={headlineRef}
          className="text-balance font-heading text-electric-wheat text-5xl font-extrabold uppercase tracking-wide sm:text-7xl"
        >
          <span className="hero-vf text-[clamp(2rem,9vw,3.75rem)] sm:text-6xl md:text-8xl">
            {hero.title.split(' ')[0]}
          </span>{' '}
          <span className="hero-vf text-[clamp(2rem,9vw,3.75rem)] sm:text-6xl md:text-8xl">
            {hero.title.split(' ')[1]}
          </span>
        </h1>

        <p className="max-w-xl text-balance font-body text-base text-white sm:text-lg">
          {hero.subtitle}
        </p>

        <div className="flex flex-col items-center">
          <p className="font-heading text-2xl font-bold text-electric-wheat sm:text-3xl">
            {hero.date}
          </p>
        </div>

        <CountdownClock targetDate={hero.targetDate} />

        <div className="animate-pulse-scale mt-4 rounded-xl">
          <a
            href={hero.ctaHref}
            onClick={playClick}
            onMouseEnter={startGlitch}
            onMouseLeave={() => setIsCtaGlitching(false)}
            onFocus={startGlitch}
            onBlur={() => setIsCtaGlitching(false)}
            className="relative flex items-center justify-center rounded-xl bg-electric-wheat px-8 py-4 font-subhead text-base font-bold uppercase tracking-widest text-deep-space shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-[transform,box-shadow] duration-150 hover:scale-105 hover:shadow-[0_12px_32px_rgba(255,198,39,0.4)] focus-visible:scale-105 active:scale-100 active:translate-y-[2px] active:shadow-[0_3px_10px_rgba(0,0,0,0.3)] sm:px-12"
          >
            <GlitchText
              text={hero.ctaLabel}
              active={isCtaGlitching}
              className="text-deep-space"
            />
          </a>
        </div>
      </motion.div>
    </section>
  )
}
