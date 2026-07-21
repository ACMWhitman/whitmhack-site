export const PAUSE_TICKS_AFTER_TYPING = 22
export const PAUSE_TICKS_AFTER_DELETING = 4

export function createTypewriterState() {
  return { phraseIndex: 0, charCount: 0, phase: 'typing', pauseTicks: 0 }
}

/**
 * Pure state-machine step: given the current typing state and the list of
 * phrases to cycle through, return the next state. No timers, no DOM —
 * a caller (a hook, typically) is responsible for invoking this once per
 * "tick" and rendering `phrase.slice(0, charCount)`.
 *
 * The cycle per phrase is: type it out character by character, pause,
 * delete it character by character, pause briefly, then move on to the
 * next phrase — wrapping back to the first once the list is exhausted, so
 * calling this repeatedly cycles forever and never reaches a final state.
 */
export function nextTypewriterState(state, phrases) {
  if (phrases.length === 0) return state
  const phrase = phrases[state.phraseIndex % phrases.length]

  if (state.phase === 'typing') {
    if (state.charCount < phrase.length) {
      return { ...state, charCount: state.charCount + 1 }
    }
    return { ...state, phase: 'pausing-full', pauseTicks: 0 }
  }

  if (state.phase === 'pausing-full') {
    if (state.pauseTicks < PAUSE_TICKS_AFTER_TYPING) {
      return { ...state, pauseTicks: state.pauseTicks + 1 }
    }
    return { ...state, phase: 'deleting' }
  }

  if (state.phase === 'deleting') {
    if (state.charCount > 0) {
      return { ...state, charCount: state.charCount - 1 }
    }
    return { ...state, phase: 'pausing-empty', pauseTicks: 0 }
  }

  // phase === 'pausing-empty'
  if (state.pauseTicks < PAUSE_TICKS_AFTER_DELETING) {
    return { ...state, pauseTicks: state.pauseTicks + 1 }
  }
  return {
    phraseIndex: (state.phraseIndex + 1) % phrases.length,
    charCount: 0,
    phase: 'typing',
    pauseTicks: 0,
  }
}
