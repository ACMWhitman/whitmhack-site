import { cn } from '../lib/cn'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * A horizontally auto-scrolling row that loops seamlessly forever: `items`
 * are rendered twice back-to-back (a real, focusable/announced copy first,
 * then an aria-hidden, unfocusable duplicate) inside a track that CSS-
 * animates from translateX(0) to translateX(-50%) — since the duplicate is
 * always exactly as wide as the real copy, "-50%" always lands the track
 * back where the real copy started, regardless of item count or width. So
 * admins adding/removing cards just changes the loop length, never the
 * mechanism.
 *
 * Pauses on hover or focus (see `.marquee-track` in index.css) so an
 * individual item's own hover/focus effects stay legible instead of
 * sliding out from under the cursor. Falls back to a single static,
 * non-duplicated row under prefers-reduced-motion.
 */
export function Marquee({
  items,
  renderItem,
  ariaLabel,
  durationSecondsPerItem = 8,
  gapClassName = 'gap-6',
  listClassName,
  listTestId,
}) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return (
      <ul
        role="list"
        aria-label={ariaLabel}
        data-testid={listTestId}
        className={cn('flex flex-wrap', gapClassName, listClassName)}
      >
        {items.map((item, index) => renderItem(item, index))}
      </ul>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-deep-space to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-deep-space to-transparent"
      />
      <div
        className={cn('marquee-track flex w-max', gapClassName)}
        style={{ '--marquee-duration': `${durationSecondsPerItem * items.length}s` }}
      >
        <ul
          role="list"
          aria-label={ariaLabel}
          data-testid={listTestId}
          className={cn('flex shrink-0', gapClassName, listClassName)}
        >
          {items.map((item, index) => renderItem(item, index, false))}
        </ul>
        <ul aria-hidden="true" className={cn('flex shrink-0', gapClassName, listClassName)}>
          {items.map((item, index) => renderItem(item, index, true))}
        </ul>
      </div>
    </div>
  )
}
