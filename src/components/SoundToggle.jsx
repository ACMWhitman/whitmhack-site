import { useSound } from '../context/SoundContext'
import { cn } from '../lib/cn'

/**
 * Global on/off switch for UI click sounds, per the accessibility
 * guideline that audio feedback needs an explicit opt-out separate from
 * prefers-reduced-motion (some visitors are fine with motion but not
 * sound, or vice versa).
 */
export function SoundToggle() {
  const { enabled, toggleEnabled } = useSound()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={toggleEnabled}
      className="inline-flex items-center gap-3 rounded-full border border-white/15 px-4 py-2 font-subhead text-xs uppercase tracking-widest text-walla-mist/70 transition-colors hover:border-laser-teal"
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative h-4 w-8 shrink-0 rounded-full border border-white/10 transition-colors duration-200',
          enabled ? 'bg-laser-teal' : 'bg-white/20'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-3 w-3 rounded-full bg-deep-space transition-transform duration-200',
            enabled ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </span>
      <span>UI Sound: {enabled ? 'On' : 'Off'}</span>
    </button>
  )
}
