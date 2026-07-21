import { describe, it, expect } from 'vitest'
import { createTypewriterState, nextTypewriterState } from './typewriter'

const PHRASES = ['hi', 'go']

function stepUntil(state, phrases, predicate, maxSteps = 1000) {
  let current = state
  for (let i = 0; i < maxSteps; i++) {
    if (predicate(current)) return current
    current = nextTypewriterState(current, phrases)
  }
  throw new Error('stepUntil exceeded maxSteps without satisfying predicate')
}

describe('typewriter state machine', () => {
  it('types one character per tick until the phrase is fully typed', () => {
    let state = createTypewriterState()
    state = nextTypewriterState(state, PHRASES)
    expect(state).toEqual({ phraseIndex: 0, charCount: 1, phase: 'typing', pauseTicks: 0 })

    state = nextTypewriterState(state, PHRASES)
    expect(state.charCount).toBe(2)
    expect(state.phase).toBe('typing')
  })

  it('moves to pausing-full once the whole phrase has been typed', () => {
    const state = stepUntil(createTypewriterState(), PHRASES, (s) => s.phase === 'pausing-full')
    expect(state.charCount).toBe(2)
  })

  it('starts deleting after the full-phrase pause elapses, and deletes character by character', () => {
    let state = stepUntil(createTypewriterState(), PHRASES, (s) => s.phase === 'deleting')
    expect(state.charCount).toBe(2)

    state = nextTypewriterState(state, PHRASES)
    expect(state.charCount).toBe(1)
  })

  it('deletes back down to zero characters, then pauses before the next phrase', () => {
    const state = stepUntil(createTypewriterState(), PHRASES, (s) => s.phase === 'pausing-empty')
    expect(state.charCount).toBe(0)
  })

  it('advances to the next phrase, wrapping around, and never stops', () => {
    let state = stepUntil(
      createTypewriterState(),
      PHRASES,
      (s) => s.phase === 'typing' && s.phraseIndex === 1
    )
    expect(state.charCount).toBe(0)

    // Keep cycling — it should wrap back around to phrase 0 rather than
    // ever reaching a terminal state.
    state = nextTypewriterState(state, PHRASES) // start typing phrase 1
    state = stepUntil(state, PHRASES, (s) => s.phase === 'typing' && s.phraseIndex === 0)
    expect(state.charCount).toBe(0)
  })

  it('keeps producing valid states indefinitely across many cycles', () => {
    let state = createTypewriterState()
    for (let i = 0; i < 5000; i++) {
      state = nextTypewriterState(state, PHRASES)
      expect(state.phraseIndex).toBeLessThan(PHRASES.length)
      expect(state.charCount).toBeGreaterThanOrEqual(0)
      expect(state.charCount).toBeLessThanOrEqual(2)
    }
  })

  it('is a no-op when given an empty phrase list', () => {
    const state = createTypewriterState()
    expect(nextTypewriterState(state, [])).toEqual(state)
  })
})
