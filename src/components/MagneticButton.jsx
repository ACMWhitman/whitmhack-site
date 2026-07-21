import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { computeMagneticOffset } from '../lib/magneticPull'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const RADIUS_PX = 80

/**
 * A button (rendered as an `<a>`) that subtly moves toward the cursor
 * when the pointer comes within RADIUS_PX of it, and eases back to rest
 * when the pointer leaves. The offset math itself lives in
 * `computeMagneticOffset` so it can be unit tested without a DOM.
 */
export function MagneticButton({ href, children, className, ...props }) {
  const ref = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.4 })

  const handlePointerMove = (event) => {
    if (prefersReducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    const offset = computeMagneticOffset(
      { x: event.clientX, y: event.clientY },
      center,
      RADIUS_PX
    )
    x.set(offset.x)
    y.set(offset.y)
  }

  const handlePointerLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={prefersReducedMotion ? undefined : { x: springX, y: springY }}
      className={className}
      {...props}
    >
      {children}
    </motion.a>
  )
}
