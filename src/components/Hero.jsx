import { useState } from 'react'
import { motion } from 'framer-motion'
import { CountdownClock } from './CountdownClock'
import { TypewriterHeadline } from './TypewriterHeadline'
import { MatrixRain } from './MatrixRain'
import { GlitchText } from './GlitchText'
import { EdgeLightFrame } from './EdgeLightFrame'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'

export function Hero() {
  const hero = useContent('hero')
  const prefersReducedMotion = usePrefersReducedMotion()
  const { playClick, playGlitch } = useSound()
  const [isCtaGlitching, setIsCtaGlitching] = useState(false)

  const startGlitch = () => {
    setIsCtaGlitching(true)
    playGlitch()
  }

  return (
    <section
      id="hero"
      aria-label="WhitmHack hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <MatrixRain />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-3xl flex-col items-center gap-6"
      >
        <p className="font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal sm:text-sm">
          {hero.eyebrow}
        </p>

        <h1 className="font-heading text-gradient-shift text-5xl font-extrabold uppercase tracking-wide drop-shadow-[0_0_30px_rgba(44,76,150,0.45)] sm:text-7xl">
          {hero.title}
        </h1>

        <TypewriterHeadline
          phrases={hero.taglines}
          className="font-subhead text-lg font-semibold text-laser-teal sm:text-xl"
        />

        <p className="max-w-xl text-balance font-body text-base text-walla-mist/80 sm:text-lg">
          {hero.subtitle}
        </p>

        <CountdownClock targetDate={hero.targetDate} />

        <EdgeLightFrame className="mt-4 rounded-full">
          <a
            href={hero.ctaHref}
            onClick={playClick}
            onMouseEnter={startGlitch}
            onMouseLeave={() => setIsCtaGlitching(false)}
            onFocus={startGlitch}
            onBlur={() => setIsCtaGlitching(false)}
            className="glass-core relative flex items-center justify-center rounded-full px-8 py-3 font-subhead text-sm font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-[transform,box-shadow] duration-150 hover:scale-105 focus-visible:scale-105 active:scale-100 active:translate-y-[2px] active:shadow-[0_3px_10px_rgba(0,0,0,0.35)]"
          >
            <GlitchText
              text={hero.ctaLabel}
              active={isCtaGlitching}
              className="text-flow-wheat animate-text-flow"
            />
          </a>
        </EdgeLightFrame>
      </motion.div>
    </section>
  )
}
