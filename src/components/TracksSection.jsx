import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/cn'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { GlitchText } from './GlitchText'
import { Marquee } from './Marquee'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'

/**
 * A single track card. `isActive` (driven by the parent, from hover *or*
 * keyboard focus) drives the border glow, falling code accent, and a
 * slight scale-up. The 3D cursor-tilt effect used to live here — it now
 * lives on the About section's bento cards instead (see
 * AboutSection.jsx), so this card keeps a simpler, flat hover state.
 *
 * `isDuplicate` cards are the Marquee's aria-hidden clone, rendered purely
 * so the loop has something to scroll into view — they're never
 * focusable and never wired to the active/glow state, so hovering the
 * clone as it drifts by never fights with the real card's own state.
 */
function TrackCard({ track, isActive, prefersReducedMotion, onActivate, onDeactivate, isDuplicate }) {
  return (
    <motion.li
      tabIndex={isDuplicate ? -1 : 0}
      role="listitem"
      data-testid={isDuplicate ? undefined : `track-card-${track.id}`}
      data-active={isDuplicate ? undefined : isActive}
      aria-label={isDuplicate ? undefined : `${track.name}, prize: ${track.prize}`}
      onMouseEnter={isDuplicate ? undefined : onActivate}
      onMouseLeave={isDuplicate ? undefined : onDeactivate}
      onFocus={isDuplicate ? undefined : onActivate}
      onBlur={isDuplicate ? undefined : onDeactivate}
      animate={{ scale: isActive && !prefersReducedMotion ? 1.03 : 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'relative w-64 shrink-0 rounded-2xl border bg-silicon-blue/80 p-6 backdrop-blur-md',
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
 * A continuously auto-scrolling, seamlessly looping row of track cards
 * (see Marquee.jsx) — cards drift right-to-left forever and pause the
 * instant the cursor or keyboard focus lands on one, so the existing
 * hover glow/glitch/falling-code effects stay just as readable as before.
 */
export function TracksSection() {
  const tracksSection = useContent('tracksSection')
  const prefersReducedMotion = usePrefersReducedMotion()
  const { playGlitch } = useSound()
  // Tracked explicitly (rather than relying on CSS-only :hover/group-hover)
  // so both the visual glow/accent *and* our tests can key off one source
  // of truth, and so keyboard focus produces the same effect as a mouse
  // hover would.
  const [activeId, setActiveId] = useState(null)

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

      <div className="mt-12 py-6">
        <Marquee
          items={tracksSection.tracks}
          ariaLabel="Track categories"
          listTestId="tracks-list"
          renderItem={(track, index, isDuplicate) => (
            <TrackCard
              key={isDuplicate ? `${track.id}-duplicate` : track.id}
              track={track}
              isActive={!isDuplicate && activeId === track.id}
              prefersReducedMotion={prefersReducedMotion}
              isDuplicate={isDuplicate}
              onActivate={() => {
                setActiveId(track.id)
                playGlitch()
              }}
              onDeactivate={() => setActiveId((current) => (current === track.id ? null : current))}
            />
          )}
        />
      </div>
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
