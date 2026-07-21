import { useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '../lib/cn'
import { computeTiltRotation } from '../lib/tilt'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'

const SPAN_CLASSES = {
  sm: 'sm:col-span-1 sm:row-span-1',
  md: 'sm:col-span-2 sm:row-span-1',
  lg: 'sm:col-span-2 sm:row-span-2',
}

const MAX_TILT_DEG = 8

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

/**
 * One bento block. Pointer position within the card drives a real
 * cursor-tracked 3D tilt (the same effect that used to live on the
 * Tracks & Prizes cards — it moved here). `hover:z-10`/`focus-within:z-10`
 * lift the tilted card above its grid neighbors so its corners are never
 * clipped behind an adjacent card while it's leaning toward the cursor.
 */
function BentoCard({ block, prefersReducedMotion }) {
  const elementRef = useRef(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20, mass: 0.5 })
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20, mass: 0.5 })
  const { playTilt } = useSound()

  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const handlePointerMove = (event) => {
    if (prefersReducedMotion || !elementRef.current) return
    const rect = elementRef.current.getBoundingClientRect()
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    const { rotateX: nextRotateX, rotateY: nextRotateY } = computeTiltRotation(
      { x: event.clientX, y: event.clientY },
      center,
      { width: rect.width, height: rect.height },
      MAX_TILT_DEG
    )
    rotateX.set(nextRotateX)
    rotateY.set(nextRotateY)
  }

  return (
    <motion.li
      ref={elementRef}
      data-testid={`about-card-${block.id}`}
      variants={cardVariants}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        if (!prefersReducedMotion) playTilt()
      }}
      onPointerLeave={resetTilt}
      onBlur={resetTilt}
      style={prefersReducedMotion ? undefined : { rotateX: springRotateX, rotateY: springRotateY }}
      className={cn(
        'group relative z-0 flex flex-col justify-center overflow-visible rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md [transform-style:preserve-3d] hover:z-10 focus-within:z-10',
        SPAN_CLASSES[block.span]
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent shadow-none transition-all duration-300 group-hover:border-electric-wheat group-hover:shadow-glow-wheat" />
      <h3 className="relative font-heading text-lg font-bold text-walla-mist transition-colors duration-300 group-hover:text-electric-wheat sm:text-xl">
        {block.heading}
      </h3>
      <p className="relative mt-2 text-sm text-walla-mist/70">{block.body}</p>
    </motion.li>
  )
}

export function AboutSection() {
  const about = useContent('about')
  const sectionRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  // `once: true` means the animation plays the first time the section
  // scrolls into view and never re-triggers on subsequent scrolls — most
  // users find repeated entrance animations distracting rather than
  // delightful.
  const isInView = useInView(sectionRef, { once: true, margin: '-100px 0px' })

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="About WhitmHack"
      data-testid="about-section"
      data-in-view={isInView}
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <p className="font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal">
        {about.eyebrow}
      </p>
      <h2 className="mt-3 max-w-2xl font-heading text-gradient-shift text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
        {about.title}
      </h2>

      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mt-12 grid grid-cols-2 gap-5 [perspective:1500px] sm:grid-cols-4 sm:auto-rows-[160px]"
      >
        {about.bento.map((block) => (
          <BentoCard key={block.id} block={block} prefersReducedMotion={prefersReducedMotion} />
        ))}
      </motion.ul>
    </section>
  )
}
