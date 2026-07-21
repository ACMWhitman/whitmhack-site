import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { RippleText } from './RippleText'

// Titles are staggered further apart than before now that each one takes
// roughly 2-3x longer to settle — keeps the cascade readable instead of
// bunching up.
const TITLE_STAGGER_MS = 150

// Brand accent pair (electric-wheat → laser-teal), reused everywhere the
// site already has a gradient (Register buttons, countdown digits) — see
// .text-flow-wheat in index.css.
const ACTIVE_GRADIENT = ['#E2A936', '#2C8D96']
// A single quiet neutral instead of a second, fainter version of the same
// accent gradient — inactive items should read as genuinely de-emphasized,
// not just "the active style at lower opacity."
const INACTIVE_COLOR = ['#7A84A3']

const MENU_FONT_SIZE = 20
const MENU_ICON_SIZE = 12
// The dot gets its own accent, independent of the text gradient next to
// it, so it reads as a distinct brand mark rather than just matching
// whichever gradient stop happened to be last.
const MENU_ICON_COLOR = '#E2A936'
const NAV_INACTIVE_FONT_SIZE = 20
// The active title is deliberately larger (not just a different color) —
// a size/weight hierarchy communicates "you are here" on its own, so the
// gradient isn't the only thing carrying that signal.
const NAV_ACTIVE_FONT_SIZE = 24

/**
 * A hidden-by-default, full-screen navigation panel: a small "Menu" label
 * fixed to the top-left corner (always visible, any scroll position) is
 * the only thing on screen until clicked. Clicking it reveals every
 * section title as a single left-anchored, vertically centered block —
 * each title "emerges" via the same liquid-distortion effect used
 * elsewhere on the site for team photos (see RippleText.jsx, adapted from
 * LiquidAvatar.jsx), staggered so they settle into place one after
 * another instead of all at once. The trigger label itself ripples on
 * every click too (its text flips between "Menu"/"Close", which is what
 * re-triggers RippleText's reveal animation) so the icon and the panel
 * read as one continuous motion rather than two separate effects.
 *
 * The active section (via IntersectionObserver, same as before) is still
 * tracked continuously in the background even while the panel is closed,
 * so whichever title is highlighted is accurate the moment it's opened.
 */
export function SpineNav() {
  const spineNav = useContent('spineNav')
  const [activeId, setActiveId] = useState(spineNav[0].id)
  const [isOpen, setIsOpen] = useState(false)
  const visibleIdsRef = useRef(new Set())
  const { playNav } = useSound()
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const elements = spineNav.map((item) => document.getElementById(item.id)).filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIdsRef.current.add(entry.target.id)
          } else {
            visibleIdsRef.current.delete(entry.target.id)
          }
        }
        const firstVisible = spineNav.find((item) => visibleIdsRef.current.has(item.id))
        if (firstVisible) setActiveId(firstVisible.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )

    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [spineNav])

  const handleToggle = () => {
    playNav()
    setIsOpen((open) => !open)
  }

  const handleNavClick = (event, id) => {
    // Scroll explicitly instead of trusting the anchor's own default
    // behavior — closing the panel unmounts this very link in the same
    // tick, and letting the browser's native hash-jump race that unmount
    // means it sometimes never happens at all.
    event.preventDefault()
    playNav()
    setActiveId(id)
    setIsOpen(false)
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        data-testid="spine-nav-toggle"
        // left-6 (24px) matches the site-wide px-6 every section uses for
        // its own left edge, at every breakpoint — not a one-off value.
        className="fixed left-6 top-6 z-50"
      >
        <RippleText
          text={isOpen ? 'Close' : 'Menu'}
          width={120}
          height={60}
          fontSize={MENU_FONT_SIZE}
          colors={ACTIVE_GRADIENT}
          icon
          iconSize={MENU_ICON_SIZE}
          iconColor={MENU_ICON_COLOR}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="spine-nav-panel"
            // Flat, fully opaque plane instead of a blurred "glass over
            // content" look — the gradient text reads as the one thing to
            // focus on, without a backdrop-blur layer competing for it.
            className="fixed inset-0 z-40 flex items-center bg-deep-space"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* pl-6 lines this block's left edge up with the toggle above it
                and with every section's own px-6 — one consistent left
                margin for the whole page, not a nav-specific value. */}
            <nav aria-label="Section navigation" className="pl-6">
              <ul className="flex flex-col gap-1 sm:gap-1.5">
                {spineNav.map((item, index) => {
                  const isActive = item.id === activeId
                  return (
                    // Slides in from the right, staggered per item (same
                    // delay as the WebGL ripple below, so the two read as
                    // one combined "slide + liquid settle" motion per
                    // title) and slides back out to the left on close —
                    // no per-item stagger on exit, so the whole list
                    // dismisses as one smooth sweep instead of a delayed
                    // trickle.
                    <motion.li
                      key={item.id}
                      initial={{ x: 64, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -64, opacity: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: 'easeOut',
                        delay: (index * TITLE_STAGGER_MS) / 1000,
                      }}
                    >
                      <a
                        href={`#${item.id}`}
                        aria-label={item.label}
                        aria-current={isActive ? 'true' : undefined}
                        data-testid={`spine-nav-${item.id}`}
                        onClick={(event) => handleNavClick(event, item.id)}
                        className="block"
                      >
                        <RippleText
                          text={item.label}
                          width={240}
                          height={36}
                          fontSize={isActive ? NAV_ACTIVE_FONT_SIZE : NAV_INACTIVE_FONT_SIZE}
                          colors={isActive ? ACTIVE_GRADIENT : INACTIVE_COLOR}
                          revealDelayMs={index * TITLE_STAGGER_MS}
                        />
                      </a>
                    </motion.li>
                  )
                })}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
