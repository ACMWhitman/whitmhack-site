import { useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { cn } from '../lib/cn'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'

/**
 * One timeline event, alternating around a central spine on md+ screens.
 * Starts dim with its details dropdown locked; brightens and unlocks once
 * it scrolls into view (same IntersectionObserver-driven activation as the
 * old left-rail version, just centered). On small screens the spine is
 * hidden and each event reads as a centered block.
 */
function TimelineEvent({ event, alignRight }) {
  const ref = useRef(null)
  const isActive = useInView(ref, { once: true, margin: '-40% 0px -40% 0px' })
  const [isOpen, setIsOpen] = useState(false)
  const { playOpen, playClose } = useSound()

  return (
    <li
      ref={ref}
      data-testid={`schedule-event-${event.id}`}
      className="relative"
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-1/2 top-1/2 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-500 md:block',
          isActive
            ? 'border-electric-wheat bg-electric-wheat shadow-[0_0_12px_rgba(255,198,39,0.5)]'
            : 'border-white/30 bg-deep-space'
        )}
      />

      <div
        className={cn(
          'relative py-8 text-center md:w-1/2 md:py-10',
          alignRight ? 'md:ml-auto md:pl-14 md:text-right' : 'md:mr-auto md:pr-14 md:text-left'
        )}
      >
        <p
          className={cn(
            'font-subhead text-xs uppercase tracking-widest transition-colors duration-500',
            isActive ? 'text-electric-wheat' : 'text-white/40'
          )}
        >
          {event.time}
        </p>

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
            'mt-2 font-heading text-lg font-bold transition-colors duration-500 disabled:cursor-not-allowed md:text-xl',
            isActive ? 'text-white' : 'text-white/45'
          )}
        >
          {event.title}
          <span
            aria-hidden="true"
            className="ml-2 align-middle font-subhead text-xs text-electric-wheat"
          >
            {isActive ? (isOpen ? '[-]' : '[+]') : '[locked]'}
          </span>
        </button>

        {isOpen && isActive && (
          <p
            id={`schedule-details-${event.id}`}
            className="mt-3 text-sm text-white/70"
          >
            {event.workshopDetails}
          </p>
        )}
      </div>
    </li>
  )
}

/**
 * Schedule — a central-spine timeline: the glowing yellow spine is drawn
 * top-to-bottom as you scroll the timeline down, and events alternate to
 * either side of it (like a classic conference schedule), with each day's
 * label centered over its events. Header stays centered like the other
 * sections.
 */
export function ScheduleSection() {
  const scheduleSection = useContent('scheduleSection')
  const timelineRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 70%', 'end 70%'],
  })
  const spineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section
      id="schedule"
      aria-label="Schedule"
      className="relative mx-auto max-w-4xl px-6 py-24"
    >
      <p className="text-center font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal">
        {scheduleSection.eyebrow}
      </p>
      <h2 className="mt-3 text-center font-heading text-electric-wheat text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
        {scheduleSection.title}
      </h2>

      <div ref={timelineRef} className="relative mt-12">
        {/* Central spine — a glowing yellow line that draws downward as
            the timeline scrolls through the viewport. */}
        <motion.span
          aria-hidden="true"
          data-testid="schedule-progress-line"
          style={{ height: spineHeight }}
          className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-electric-wheat shadow-[0_0_12px_rgba(255,198,39,0.45)]"
        />

        <ol className="list-none">
          {scheduleSection.days.map((day, dayIndex) => {
            const dayStartIndex = scheduleSection.days
              .slice(0, dayIndex)
              .reduce((sum, d) => sum + d.events.length, 0)

            return (
              <li key={day.id}>
                <h3 className="py-6 text-center font-subhead text-sm font-bold uppercase tracking-widest text-electric-wheat md:py-8">
                  {day.label}
                </h3>
                <ul className="list-none">
                  {day.events.map((event, index) => {
                    const alignRight = (dayStartIndex + index) % 2 === 1
                    return (
                      <TimelineEvent key={event.id} event={event} alignRight={alignRight} />
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ol>
      </div>

      <p className="sr-only">
        {scheduleSection.days.reduce((sum, day) => sum + day.events.length, 0)} schedule events.
      </p>
    </section>
  )
}
