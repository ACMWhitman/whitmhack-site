import { cn } from '../lib/cn'

/**
 * A thin solid gold hairline frame: a clipping wrapper with a flat
 * Whitman Yellow layer sitting behind whatever's passed as children.
 * Children supply their own solid background (the Register buttons use
 * `.glass-core` frosted navy glass, the countdown cells a solid
 * `bg-silicon-blue` fill) so only a tight ring of the yellow peeks out
 * around the edge — this wrapper's 1.5px padding is what carves out that
 * ring. (This used to be a spinning conic-gradient "edge light"; the
 * animated gradient was removed in favor of the flat brand frame.)
 */
export function EdgeLightFrame({ className, children }) {
  return (
    <div className={cn('group relative overflow-hidden p-[1.5px]', className)}>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-electric-wheat" />
      {children}
    </div>
  )
}
