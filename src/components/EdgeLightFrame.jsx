import { cn } from '../lib/cn'

/**
 * The outer two layers of the glass + spinning edge-light effect: a
 * clipping wrapper plus a conic-gradient sitting behind whatever's passed
 * as children. Children supply their own solid-ish background (see
 * `.glass-core` / `.glass-core-light` in index.css) so only a tight ring
 * of the gradient peeks out around the edge — this wrapper's 1.5px
 * padding is what carves out that ring, not blur or a negative inset,
 * which is what keeps the light "tight and focused" instead of a soft
 * bleeding aura.
 */
export function EdgeLightFrame({ className, children }) {
  return (
    <div className={cn('group relative overflow-hidden p-[1.5px]', className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 animate-border-spin bg-[conic-gradient(from_0deg,transparent_20%,#2C4C96_40%,#2C8D96_60%,transparent_80%)] [will-change:transform]"
      />
      {children}
    </div>
  )
}
