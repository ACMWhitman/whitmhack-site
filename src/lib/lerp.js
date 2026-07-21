/**
 * Pure function: move `current` a `factor` fraction of the way toward
 * `target`. Used to smooth a value frame-to-frame (e.g. the WebGL ripple
 * strength easing in in/out on hover) without pulling in a full animation
 * library for a one-line formula.
 */
export function lerp(current, target, factor) {
  return current + (target - current) * factor
}
