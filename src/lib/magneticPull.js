/**
 * Pure function: given the cursor position, the element's center, an
 * attraction radius, and a strength multiplier, return how far the
 * element should shift toward the cursor. Outside the radius, the offset
 * is zero (the button doesn't move at all). Kept independent of the DOM
 * so the math can be unit tested without mounting a component or
 * simulating real mouse events.
 */
export function computeMagneticOffset(cursor, center, radius, strength = 0.35) {
  const dx = cursor.x - center.x
  const dy = cursor.y - center.y
  const distance = Math.hypot(dx, dy)

  if (distance >= radius) {
    return { x: 0, y: 0 }
  }

  // Pull is strongest at the exact center (distance 0) and fades linearly
  // to zero at the edge of the radius, so the effect doesn't "snap" on
  // and off abruptly as the cursor crosses the boundary.
  const pull = (1 - distance / radius) * strength

  return { x: dx * pull, y: dy * pull }
}
