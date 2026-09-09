import { LiquidAvatar } from './LiquidAvatar'
import { useContent } from '../context/ContentContext'

function OrganizerCard({ person, accentIndex }) {
  return (
    <li className="flex flex-col items-center text-center">
      <LiquidAvatar name={person.name} accentIndex={accentIndex} />
      <p className="mt-4 font-heading text-lg font-bold text-white">{person.name}</p>
      <p className="font-subhead text-xs uppercase tracking-widest text-white/60">
        {person.role}
      </p>
    </li>
  )
}

/**
 * Organizers & Team — a static grid of team members (the auto-scrolling
 * marquee was removed). Headings stay centered like the other sections.
 */
export function OrganizersSection() {
  const organizersSection = useContent('organizersSection')

  return (
    <section
      id="organizers"
      aria-label="Organizers and team"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <p className="text-center font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal">
        {organizersSection.eyebrow}
      </p>
      <h2 className="text-balance mt-3 text-center font-heading text-electric-wheat text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
        {organizersSection.title}
      </h2>

      <ul
        aria-label="Team members"
        data-testid="organizers-list"
        className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
      >
        {organizersSection.organizers.map((person, index) => (
          <OrganizerCard key={person.id} person={person} accentIndex={index} />
        ))}
      </ul>
    </section>
  )
}
