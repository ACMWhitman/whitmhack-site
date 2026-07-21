function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Pure function: given the cursor's position, an element's center point,
 * and its size, return the rotateX/rotateY (in degrees) that would tilt
 * the element toward the cursor — the same math behind libraries like
 * vanilla-tilt.js. Moving the cursor right tilts the element's right edge
 * away from the viewer (positive rotateY); moving it up tilts the top
 * edge toward the viewer (positive rotateX). Kept independent of the DOM
 * so it can be unit tested without a real pointer or element.
 */
export function computeTiltRotation(cursor, center, size, maxTiltDeg = 10) {
  const halfWidth = size.width / 2
  const halfHeight = size.height / 2
  if (halfWidth === 0 || halfHeight === 0) {
    return { rotateX: 0, rotateY: 0 }
  }

  const offsetX = cursor.x - center.x
  const offsetY = cursor.y - center.y

  // `+ 0` normalizes away `-0` (e.g. offsetY of 0 times a negative sign),
  // which is mathematically equal to 0 but trips up strict equality in tests.
  const rotateY = clamp((offsetX / halfWidth) * maxTiltDeg, -maxTiltDeg, maxTiltDeg) + 0
  const rotateX = clamp((-offsetY / halfHeight) * maxTiltDeg, -maxTiltDeg, maxTiltDeg) + 0

  return { rotateX, rotateY }
}
