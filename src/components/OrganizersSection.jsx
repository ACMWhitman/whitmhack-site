import { LiquidAvatar } from './LiquidAvatar'
import { Marquee } from './Marquee'
import { useContent } from '../context/ContentContext'

function OrganizerCard({ person, accentIndex }) {
  return (
    <li className="flex w-48 shrink-0 flex-col items-center text-center">
      <LiquidAvatar name={person.name} accentIndex={accentIndex} />
      <p className="mt-4 font-heading text-lg font-bold text-walla-mist">{person.name}</p>
      <p className="font-subhead text-xs uppercase tracking-widest text-walla-mist/60">
        {person.role}
      </p>
    </li>
  )
}

/**
 * A continuously auto-scrolling, seamlessly looping row of the team (see
 * Marquee.jsx) — replaced the earlier 3-column, scroll-driven vertical
 * parallax layout with the same horizontal drift treatment Tracks uses,
 * so the two "browse a row of cards" sections on the page now share one
 * consistent interaction instead of two different ones.
 */
export function OrganizersSection() {
  const organizersSection = useContent('organizersSection')

  return (
    <section
      id="organizers"
      aria-label="Organizers and team"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <p className="font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal">
        {organizersSection.eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-gradient-shift text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
        {organizersSection.title}
      </h2>

      <div className="mt-12 py-6">
        <Marquee
          items={organizersSection.organizers}
          ariaLabel="Team members"
          gapClassName="gap-10"
          renderItem={(person, index) => (
            <OrganizerCard key={`${person.id}-${index}`} person={person} accentIndex={index} />
          )}
        />
      </div>
    </section>
  )
}
