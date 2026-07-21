import { useEffect, useRef, useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'
import { useSound } from '../context/SoundContext'

/**
 * Renders a continuously-cycling typewriter effect. The animated text is
 * hidden from assistive tech (`aria-hidden`) because a screen reader
 * re-announcing every keystroke of a never-ending animation would be
 * unusable noise; a plain, static, visually-hidden sentence carries the
 * same information once for screen reader users instead.
 *
 * The keystroke sound is intentionally quiet the rest of the time: it
 * only plays during the very first pass (the phrase typing itself out
 * when the page first loads) or while the visitor's cursor is actively
 * hovering the text — every later typing/deleting cycle that happens
 * off-hover stays silent.
 */
export function TypewriterHeadline({ phrases, className }) {
  const { text: displayedText, isFirstTypingPass } = useTypewriter(phrases)
  const { playKeystroke } = useSound()
  const previousLengthRef = useRef(displayedText.length)
  const [isHovered, setIsHovered] = useState(false)

  // Fires a tick on every character added *or* removed — the typing and
  // deleting phases both change `displayedText.length` one step at a
  // time, so watching the length is enough to catch each keystroke
  // without duplicating the pure state machine's typing/deleting logic.
  useEffect(() => {
    const lengthChanged = displayedText.length !== previousLengthRef.current
    previousLengthRef.current = displayedText.length
    if (lengthChanged && (isFirstTypingPass || isHovered)) {
      playKeystroke()
    }
  }, [displayedText, isFirstTypingPass, isHovered, playKeystroke])

  return (
    <div>
      <p
        aria-hidden="true"
        data-testid="typewriter-display"
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {displayedText}
        <span aria-hidden="true" className="typewriter-cursor">
          |
        </span>
      </p>
      <p className="sr-only">{phrases.join('. ')}</p>
    </div>
  )
}
