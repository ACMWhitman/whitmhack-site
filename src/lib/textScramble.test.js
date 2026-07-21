import { describe, it, expect, vi } from 'vitest'
import { scrambleFrame } from './textScramble'

describe('scrambleFrame', () => {
  it('reveals nothing when revealCount is 0, using only glyph characters', () => {
    const alwaysFirstGlyph = () => 0
    const result = scrambleFrame('AB', 0, '#', alwaysFirstGlyph)
    expect(result).toBe('##')
  })

  it('reveals the full target once revealCount reaches the string length', () => {
    const result = scrambleFrame('hello world', 11)
    expect(result).toBe('hello world')
  })

  it('reveals characters left to right up to revealCount, scrambling the rest', () => {
    const alwaysHash = () => 0
    const result = scrambleFrame('abcdef', 3, '#', alwaysHash)
    expect(result).toBe('abc###')
  })

  it('never scrambles spaces, even when unrevealed', () => {
    const alwaysHash = () => 0
    const result = scrambleFrame('go now', 0, '#', alwaysHash)
    expect(result).toBe('## ###')
  })
})
