import { useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { cn } from '../lib/cn'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * One row on the timeline. Starts dim with its workshop-details dropdown
 * locked; brightens and unlocks once it scrolls into view. Activation is
 * driven by this block's own IntersectionObserver rather than a single
 * global scroll calculation, which keeps each block's "have we reached
 * it yet" state simple to reason about and to test in isolation.
 *
 * The time label and the title/details block also ride this row's own
 * scroll transit at two different rates (an "asymmetric scroll velocity"
 * parallax) — the two columns drift apart slightly as the row scrolls
 * through the viewport, then re-converge, giving the timeline a sense of
 * physical depth instead of moving as one flat block.
 */
function TimelineEvent({ event, isLast }) {
  const ref = useRef(null)
  const isActive = useInView(ref, { once: true, margin: '-40% 0px -40% 0px' })
  const [isOpen, setIsOpen] = useState(false)
  const { playOpen, playClose } = useSound()
  const prefersReducedMotion = usePrefersReducedMotion()

  const { scrollYProgress: rowProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const timeY = useTransform(rowProgress, [0, 1], [26, -26])
  const contentY = useTransform(rowProgress, [0, 1], [12, -12])

  return (
    <li ref={ref} className="relative pb-10 pl-10" data-testid={`schedule-event-${event.id}`}>
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[7px] top-3 h-full w-px bg-white/15"
        />
      )}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 transition-colors duration-500',
          isActive ? 'border-laser-teal bg-laser-teal shadow-glow-teal' : 'border-white/30 bg-deep-space'
        )}
      />

      <motion.p
        style={prefersReducedMotion ? undefined : { y: timeY }}
        className={cn(
          'font-subhead text-xs uppercase tracking-widest transition-colors duration-500',
          isActive ? 'text-laser-teal' : 'text-walla-mist/55'
        )}
      >
        {event.time}
      </motion.p>

      <motion.div style={prefersReducedMotion ? undefined : { y: contentY }}>
        <button
          type="button"
          disabled={!isActive}
          aria-expanded={isOpen}
          aria-controls={`schedule-details-${event.id}`}
          data-testid={`schedule-toggle-${event.id}`}
          onClick={() => {
            if (isOpen) playClose()
            else playOpen()
            setIsOpen((open) => !open)
          }}
          className={cn(
            'mt-1 text-left font-heading text-lg font-bold transition-colors duration-500 disabled:cursor-not-allowed',
            isActive ? 'text-walla-mist' : 'text-walla-mist/55'
          )}
        >
          {event.title}
          <span className="ml-2 font-subhead text-xs text-laser-teal">
            {isActive ? (isOpen ? '[-]' : '[+]') : '[locked]'}
          </span>
        </button>

        {isOpen && isActive && (
          <p
            id={`schedule-details-${event.id}`}
            className="mt-2 max-w-md text-sm text-walla-mist/70"
          >
            {event.workshopDetails}
          </p>
        )}
      </motion.div>
    </li>
  )
}

export function ScheduleSection() {
  const scheduleSection = useContent('scheduleSection')
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const allEvents = scheduleSection.days.flatMap((day) => day.events)

  return (
    <section
      id="schedule"
      aria-label="Schedule"
      ref={containerRef}
      className="relative mx-auto max-w-3xl px-6 py-24"
    >
      <p className="font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal">
        {scheduleSection.eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-gradient-shift text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
        {scheduleSection.title}
      </h2>

      <div className="relative mt-12">
        <motion.span
          aria-hidden="true"
          data-testid="schedule-progress-line"
          style={{ height: lineHeight }}
          className="absolute left-[7px] top-0 w-px bg-laser-teal shadow-glow-teal"
        />

        {scheduleSection.days.map((day) => (
          <div key={day.id} className="mb-8">
            <h3 className="mb-4 pl-10 font-subhead text-sm font-bold uppercase tracking-widest text-electric-wheat">
              {day.label}
            </h3>
            <ul>
              {day.events.map((event, index) => (
                <TimelineEvent
                  key={event.id}
                  event={event}
                  isLast={
                    day.id === scheduleSection.days[scheduleSection.days.length - 1].id &&
                    index === day.events.length - 1
                  }
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="sr-only">
        {allEvents.length} schedule events across {scheduleSection.days.length} days.
      </p>
    </section>
  )
}
