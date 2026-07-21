import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { LiquidAvatar } from './LiquidAvatar'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useContent } from '../context/ContentContext'

// Left column tracks the page 1:1 ("normal" speed); center drifts further
// than the page scrolls (feels faster); right drifts the opposite way
// (feels slower/anchored) — the same per-column "asymmetric scroll
// velocity" idiom ScheduleSection.jsx already uses per-row, just applied
// across three columns instead of two sub-elements of one row.
const COLUMN_SCROLL_FACTORS = [1, 1.4, 0.7]
const COLUMN_COUNT = COLUMN_SCROLL_FACTORS.length

function OrganizerCard({ person, accentIndex }) {
  return (
    <li className="flex flex-col items-center text-center">
      <LiquidAvatar name={person.name} accentIndex={accentIndex} />
      <p className="mt-4 font-heading text-lg font-bold text-walla-mist">{person.name}</p>
      <p className="font-subhead text-xs uppercase tracking-widest text-walla-mist/60">
        {person.role}
      </p>
    </li>
  )
}

function OrganizerColumn({ people, scrollFactor, containerRef, disableParallax }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const travel = 120 * (scrollFactor - 1)
  const y = useTransform(scrollYProgress, [0, 1], [-travel, travel])

  return (
    <motion.ul
      style={disableParallax ? undefined : { y }}
      className="flex flex-col gap-8 will-change-transform"
    >
      {people.map(({ person, accentIndex }) => (
        <OrganizerCard key={person.id} person={person} accentIndex={accentIndex} />
      ))}
    </motion.ul>
  )
}

export function OrganizersSection() {
  const organizersSection = useContent('organizersSection')
  const containerRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const disableParallax = prefersReducedMotion || isMobile

  const columns = Array.from({ length: COLUMN_COUNT }, () => [])
  organizersSection.organizers.forEach((person, index) => {
    columns[index % COLUMN_COUNT].push({ person, accentIndex: index })
  })

  return (
    <section
      id="organizers"
      aria-label="Organizers and team"
      ref={containerRef}
      className="mx-auto max-w-6xl overflow-hidden px-6 py-24"
    >
      <p className="font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal">
        {organizersSection.eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-gradient-shift text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
        {organizersSection.title}
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {columns.map((people, columnIndex) => (
          <OrganizerColumn
            key={columnIndex}
            people={people}
            scrollFactor={COLUMN_SCROLL_FACTORS[columnIndex]}
            containerRef={containerRef}
            disableParallax={disableParallax}
          />
        ))}
      </div>
    </section>
  )
}
