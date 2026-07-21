import { useEffect, useState } from 'react'
import { getCountdown } from '../lib/countdown'
import { EdgeLightFrame } from './EdgeLightFrame'

const UNITS = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
]

export function CountdownClock({ targetDate }) {
  const [countdown, setCountdown] = useState(() => getCountdown(targetDate))

  useEffect(() => {
    const tick = () => setCountdown(getCountdown(targetDate))
    tick()
    const intervalId = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalId)
  }, [targetDate])

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={
        countdown.isComplete
          ? 'WhitmHack has started'
          : `${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, and ${countdown.seconds} seconds until WhitmHack`
      }
      className="flex gap-3 sm:gap-6"
    >
      {countdown.isComplete ? (
        <p className="font-heading text-2xl font-bold text-electric-wheat">
          WhitmHack is live!
        </p>
      ) : (
        UNITS.map(({ key, label }) => (
          <EdgeLightFrame key={key} className="rounded-xl">
            <div className="glass-core-light flex flex-col items-center rounded-xl border border-white/20 px-3 py-2 backdrop-blur-md sm:px-5 sm:py-3">
              <span
                className="text-flow-wheat animate-text-flow font-subhead text-2xl font-extrabold tabular-nums sm:text-4xl"
                data-testid={`countdown-${key}`}
              >
                {String(countdown[key]).padStart(2, '0')}
              </span>
              <span className="mt-1 font-subhead text-[10px] uppercase tracking-widest text-walla-mist/60 sm:text-xs">
                {label}
              </span>
            </div>
          </EdgeLightFrame>
        ))
      )}
    </div>
  )
}
