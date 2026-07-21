import { useState } from 'react'
import { MagneticButton } from './MagneticButton'
import { SoundToggle } from './SoundToggle'
import { GlitchText } from './GlitchText'
import { EdgeLightFrame } from './EdgeLightFrame'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'

export function FooterSection() {
  const footerSection = useContent('footerSection')
  const hero = useContent('hero')
  const { playClick } = useSound()
  const [isCtaGlitching, setIsCtaGlitching] = useState(false)

  return (
    <footer id="register" aria-label="Register and site footer" className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="font-heading text-gradient-shift text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
          Ready to hack?
        </h2>
        {/* PLACEHOLDER: write 1 sentence reinforcing the CTA. */}
        <p className="mt-3 max-w-md font-body text-sm text-walla-mist/70">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Spots are limited — register today.
        </p>

        <EdgeLightFrame className="mt-8 rounded-full">
          <MagneticButton
            href={hero.ctaHref}
            onClick={playClick}
            onMouseEnter={() => setIsCtaGlitching(true)}
            onMouseLeave={() => setIsCtaGlitching(false)}
            onFocus={() => setIsCtaGlitching(true)}
            onBlur={() => setIsCtaGlitching(false)}
            className="glass-core relative flex items-center justify-center rounded-full px-10 py-4 font-subhead text-base font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-shadow duration-150 active:shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
          >
            <GlitchText
              text={footerSection.registerLabel}
              active={isCtaGlitching}
              className="text-flow-wheat animate-text-flow"
            />
          </MagneticButton>
        </EdgeLightFrame>

        <div className="mt-6">
          <SoundToggle />
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-10 border-t border-white/10 pt-12 text-center sm:grid-cols-3 sm:text-left">
        <div>
          <h3 className="font-subhead text-sm font-bold uppercase tracking-widest text-electric-wheat">
            Organizers
          </h3>
          <p className="mt-3 text-sm text-parchment/80">{footerSection.organizers}</p>
        </div>

        <nav aria-label={footerSection.resourcesHeading}>
          <h3 className="font-subhead text-sm font-bold uppercase tracking-widest text-electric-wheat">
            {footerSection.resourcesHeading}
          </h3>
          <ul className="mt-3 space-y-2">
            {footerSection.resources.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="text-sm text-parchment/80 underline-offset-4 hover:text-laser-teal hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={footerSection.socialHeading}>
          <h3 className="font-subhead text-sm font-bold uppercase tracking-widest text-electric-wheat">
            {footerSection.socialHeading}
          </h3>
          <ul className="mt-3 space-y-2">
            {footerSection.social.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="text-sm text-parchment/80 underline-offset-4 hover:text-laser-teal hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mt-16 text-center font-body text-xs text-walla-mist/70">
        &copy; {new Date().getFullYear()} WhitmHack &middot; Whitman College
      </p>
    </footer>
  )
}
