import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/cn'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { GlitchText } from './GlitchText'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'

/**
 * A single track card. `isActive` (driven by the parent, from hover *or*
 * keyboard focus) drives the border glow, falling code accent, and a
 * slight scale-up. The 3D cursor-tilt effect used to live here — it now
 * lives on the About section's bento cards instead (see
 * AboutSection.jsx), so this card keeps a simpler, flat hover state.
 */
function TrackCard({ track, index, isActive, prefersReducedMotion, registerRef, onActivate, onDeactivate, onKeyDown }) {
  return (
    <motion.li
      ref={registerRef}
      tabIndex={0}
      role="listitem"
      data-testid={`track-card-${track.id}`}
      data-active={isActive}
      aria-label={`${track.name}, prize: ${track.prize}`}
      onKeyDown={(event) => onKeyDown(event, index)}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      animate={{ scale: isActive && !prefersReducedMotion ? 1.03 : 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'relative w-64 shrink-0 snap-center rounded-2xl border bg-silicon-blue/80 p-6 backdrop-blur-md',
        isActive ? 'border-electric-wheat shadow-glow-wheat' : 'border-white/15'
      )}
    >
      <FallingCodeAccent visible={isActive} />
      <GlitchText
        as="h3"
        text={track.name}
        active={isActive}
        className={cn(
          'font-heading text-xl font-bold transition-colors',
          isActive ? 'text-electric-wheat' : 'text-walla-mist'
        )}
      />
      <GlitchText
        as="p"
        text={track.description}
        active={isActive}
        className="mt-2 text-sm text-walla-mist/70"
      />
      <p className="relative mt-4 font-subhead text-sm font-bold text-electric-wheat">
        {track.prize}
      </p>
    </motion.li>
  )
}

/**
 * Horizontally-scrolling, keyboard-navigable carousel of track cards.
 * Arrow Left/Right move focus between cards and scroll the focused card
 * into view — the carousel doesn't rely on a mouse to be usable.
 */
export function TracksSection() {
  const tracksSection = useContent('tracksSection')
  const cardRefs = useRef([])
  const prefersReducedMotion = usePrefersReducedMotion()
  const { playGlitch } = useSound()
  // Tracked explicitly (rather than relying on CSS-only :hover/group-hover)
  // so both the visual glow/accent *and* our tests can key off one source
  // of truth, and so keyboard focus produces the same effect as a mouse
  // hover would.
  const [activeIndex, setActiveIndex] = useState(null)

  const focusCard = (index) => {
    const card = cardRefs.current[index]
    if (!card) return
    card.focus()
    card.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }

  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusCard(Math.min(index + 1, tracksSection.tracks.length - 1))
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusCard(Math.max(index - 1, 0))
    }
  }

  return (
    <section
      id="tracks"
      aria-label="Tracks and prizes"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <p className="font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal">
        {tracksSection.eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-gradient-shift text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
        {tracksSection.title}
      </h2>

      <ul
        role="list"
        aria-label="Track categories"
        className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-12 pt-6 pb-14"
      >
        {tracksSection.tracks.map((track, index) => (
          <TrackCard
            key={track.id}
            track={track}
            index={index}
            isActive={activeIndex === index}
            prefersReducedMotion={prefersReducedMotion}
            registerRef={(node) => {
              cardRefs.current[index] = node
            }}
            onActivate={() => {
              setActiveIndex(index)
              playGlitch()
            }}
            onDeactivate={() => setActiveIndex((current) => (current === index ? null : current))}
            onKeyDown={handleKeyDown}
          />
        ))}
      </ul>
    </section>
  )
}

const FALLING_CODE_GLYPHS = '01{}<>/*+-'

function FallingCodeAccent({ visible }) {
  const columns = Array.from({ length: 6 })
  return (
    <div
      aria-hidden="true"
      data-testid="falling-code-accent"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-2xl transition-opacity duration-300',
        visible ? 'opacity-35' : 'opacity-0'
      )}
    >
      {columns.map((_, columnIndex) => (
        <span
          key={columnIndex}
          className="absolute top-0 font-mono text-xs text-laser-teal"
          style={{ left: `${columnIndex * 17}%` }}
        >
          {Array.from({ length: 10 })
            .map((_, i) => FALLING_CODE_GLYPHS[(columnIndex + i) % FALLING_CODE_GLYPHS.length])
            .join(' ')}
        </span>
      ))}
    </div>
  )
}
