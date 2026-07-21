const DEFAULT_GLYPHS = '!<>-_\\/[]{}=+*^?#01'

/**
 * Pure function: given a target string and how many characters (from the
 * left) should already be "decoded," return a frame where decoded
 * characters show their final value and the rest are random glyphs.
 * Spaces are always left alone so words don't visually collide.
 *
 * A caller advances `revealCount` from 0 up to `target.length` across
 * several frames to produce the scramble/decode effect.
 */
export function scrambleFrame(target, revealCount, glyphs = DEFAULT_GLYPHS, random = Math.random) {
  return target
    .split('')
    .map((char, index) => {
      if (char === ' ') return ' '
      if (index < revealCount) return char
      return glyphs[Math.floor(random() * glyphs.length)]
    })
    .join('')
}
