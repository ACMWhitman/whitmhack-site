const UNIT_MS = {
  days: 1000 * 60 * 60 * 24,
  hours: 1000 * 60 * 60,
  minutes: 1000 * 60,
  seconds: 1000,
}

/**
 * Pure function: given a target date/time and the current time, return the
 * remaining days/hours/minutes/seconds. No DOM, no timers — safe to unit
 * test with fixed inputs and safe to call from a React effect on a tick.
 */
export function getCountdown(targetDate, now = new Date()) {
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate)
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true }
  }

  return {
    days: Math.floor(diff / UNIT_MS.days),
    hours: Math.floor((diff % UNIT_MS.days) / UNIT_MS.hours),
    minutes: Math.floor((diff % UNIT_MS.hours) / UNIT_MS.minutes),
    seconds: Math.floor((diff % UNIT_MS.minutes) / UNIT_MS.seconds),
    isComplete: false,
  }
}
