import { describe, it, expect } from 'vitest'
import { getInitials } from './initials'

describe('getInitials', () => {
  it('takes the first letter of the first and last word for a full name', () => {
    expect(getInitials('Jordan Avery')).toBe('JA')
  })

  it('handles names with more than two words by using the first and last', () => {
    expect(getInitials('Sam Lee Rivera')).toBe('SR')
  })

  it('takes the first two letters of a single-word name', () => {
    expect(getInitials('Cher')).toBe('CH')
  })

  it('returns an empty string for empty or whitespace-only input', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })

  it('collapses extra whitespace between words', () => {
    expect(getInitials('  Priya   Shah  ')).toBe('PS')
  })

  it('always returns uppercase letters, regardless of input case', () => {
    expect(getInitials('marcus lee')).toBe('ML')
  })
})
