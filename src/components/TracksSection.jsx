import { cn } from '../lib/cn'
import { useContent } from '../context/ContentContext'

const SPAN_CLASSES = {
  sm: 'sm:col-span-1 sm:row-span-1',
  md: 'sm:col-span-2 sm:row-span-1',
  lg: 'sm:col-span-2 sm:row-span-2',
}

/**
 * One award tile — navy card (matching the page background) with a yellow
 * border; white headings/body with the prize amount in glowing brand
 * Yellow.
 */
function AwardCard({ track }) {
  const isLarge = track.span === 'lg'
  return (
    <li
      data-testid={`track-card-${track.id}`}
      className={cn(
        'relative flex flex-col justify-center rounded-2xl border-2 border-electric-wheat bg-deep-space p-6',
        SPAN_CLASSES[track.span]
      )}
    >
      <h3
        className={cn(
          'font-heading font-extrabold uppercase tracking-wide text-electric-wheat',
          isLarge ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
        )}
      >
        {track.name}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-white">{track.description}</p>
      <p
        className={cn(
          'award-amount mt-5 font-heading font-extrabold tabular-nums',
          isLarge ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl',
          track.prize.startsWith('$') && 'award-pulse'
        )}
      >
        {track.prize}
      </p>
    </li>
  )
}

/**
 * Awards & Prizes — a static bento grid (the same layout language as the
 * About section): a big First Place box, a wide Second Place tile, then
 * Third Place and the participation-certificate tile. No marquee.
 */
export function TracksSection() {
  const tracksSection = useContent('tracksSection')

  return (
    <section
      id="tracks"
      aria-label="Awards and prizes"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <p className="text-center font-subhead text-xs uppercase tracking-[0.3em] text-electric-wheat">
        {tracksSection.eyebrow}
      </p>
      <h2 className="text-balance mt-3 text-center font-heading text-electric-wheat text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
        {tracksSection.title}
      </h2>

      <ul
        aria-label="Awards and prizes"
        data-testid="tracks-list"
        className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-4 sm:auto-rows-[180px]"
      >
        {tracksSection.tracks.map((track) => (
          <AwardCard key={track.id} track={track} />
        ))}
      </ul>
    </section>
  )
}
