import { useEffect, useRef, useState } from 'react'
import { createTypewriterState, nextTypewriterState } from '../lib/typewriter'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const TICK_MS = 45

/**
 * Cycles through `phrases` forever — typing each one out, pausing,
 * deleting it, and moving to the next (wrapping back to the first at the
 * end). The state machine itself lives in `nextTypewriterState`; this
 * hook is just the timer that drives it and the derived display string.
 *
 * Also reports `isFirstTypingPass`: true only while the very first phrase
 * is being typed out for the very first time (mount until it finishes
 * and starts pausing) — never again afterwards, even once the cycle
 * wraps back around to phrase index 0. Callers use this to distinguish
 * "the page just loaded and this text is appearing for the first time"
 * from every later repeat of the same animation.
 *
 * Respects prefers-reduced-motion by skipping the animation entirely and
 * showing the first phrase fully typed and static — a continuously
 * mutating, non-stopping animation is exactly the kind of motion that
 * preference exists to opt out of.
 */
export function useTypewriter(phrases) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [state, setState] = useState(createTypewriterState)
  const firstPassDoneRef = useRef(false)

  useEffect(() => {
    if (state.phase !== 'typing') firstPassDoneRef.current = true
  }, [state.phase])

  useEffect(() => {
    if (prefersReducedMotion || phrases.length === 0) return
    const intervalId = window.setInterval(() => {
      setState((current) => nextTypewriterState(current, phrases))
    }, TICK_MS)
    return () => window.clearInterval(intervalId)
  }, [phrases, prefersReducedMotion])

  if (phrases.length === 0) return { text: '', isFirstTypingPass: false }
  if (prefersReducedMotion) return { text: phrases[0], isFirstTypingPass: false }

  const phrase = phrases[state.phraseIndex % phrases.length]
  const isFirstTypingPass =
    state.phraseIndex === 0 && state.phase === 'typing' && !firstPassDoneRef.current

  return { text: phrase.slice(0, state.charCount), isFirstTypingPass }
}
