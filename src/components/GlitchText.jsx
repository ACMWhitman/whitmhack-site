import { cn } from '../lib/cn'

/**
 * Wraps `text` so it can be "glitched" — sliced into color-shifted copies
 * that jump horizontally for a moment — driven by the `active` prop
 * rather than raw CSS `:hover`. Every other hover-driven effect in this
 * project tracks hover/focus as explicit JS state (see TracksSection,
 * AboutSection) so the same interaction is testable and works identically
 * for mouse and keyboard focus; this follows that same pattern.
 */
export function GlitchText({ text, active, as: Tag = 'span', className }) {
  return (
    <Tag data-text={text} className={cn('glitch-text relative', active && 'is-glitching', className)}>
      {text}
    </Tag>
  )
}
