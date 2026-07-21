import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  playClickSound,
  playNavSound,
  playOpenSound,
  playCloseSound,
  playToggleOnSound,
  playToggleOffSound,
  playKeystrokeSound,
  playSplashSound,
  playTiltSound,
  playGlitchSound,
} from '../lib/uiSounds'

const STORAGE_KEY = 'whitmhack-sound-enabled'
const SoundContext = createContext(null)

function readStoredPreference() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // Storage can be unavailable (private browsing, disabled cookies) —
    // fall back to the safe default of "off" rather than throwing.
    return false
  }
}

/**
 * Shares one "are UI sounds on?" flag across the whole app, defaulting to
 * off (autoplaying sound on load is a bad surprise, and browsers block
 * AudioContext until a user gesture anyway) and persisting the visitor's
 * choice across visits.
 */
export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(readStoredPreference)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {
      // Ignore storage failures — the preference just won't persist.
    }
  }, [enabled])

  const toggleEnabled = useCallback(() => {
    // The toggle is the one control that must be audible regardless of
    // the setting it's changing — every other sound in the app is gated
    // on `enabled`, but gating this one the same way would mean the very
    // first click that turns sound on stays silent (enabled is still
    // false at the moment of that click), and there'd be no confirmation
    // at all that switching off actually worked either.
    //
    // This reads `enabled` directly rather than playing the sound inside
    // the `setEnabled` updater — React (in StrictMode/dev) invokes a
    // functional updater twice to check it's pure, so a side effect
    // living inside one would fire twice per click.
    if (enabled) playToggleOffSound()
    else playToggleOnSound()
    setEnabled((current) => !current)
  }, [enabled])

  const playClick = useCallback(() => {
    if (enabled) playClickSound()
  }, [enabled])

  const playNav = useCallback(() => {
    if (enabled) playNavSound()
  }, [enabled])

  const playOpen = useCallback(() => {
    if (enabled) playOpenSound()
  }, [enabled])

  const playClose = useCallback(() => {
    if (enabled) playCloseSound()
  }, [enabled])

  // One per hover/animation effect, matching it by ear: a typewriter tick
  // for the hero's typing text, a droplet for the liquid-avatar ripple, a
  // whoosh for the About bento tilt, and a static burst for the glitch
  // hover on Register/track cards.
  const playKeystroke = useCallback(() => {
    if (enabled) playKeystrokeSound()
  }, [enabled])

  const playSplash = useCallback(() => {
    if (enabled) playSplashSound()
  }, [enabled])

  const playTilt = useCallback(() => {
    if (enabled) playTiltSound()
  }, [enabled])

  const playGlitch = useCallback(() => {
    if (enabled) playGlitchSound()
  }, [enabled])

  return (
    <SoundContext.Provider
      value={{
        enabled,
        toggleEnabled,
        playClick,
        playNav,
        playOpen,
        playClose,
        playKeystroke,
        playSplash,
        playTilt,
        playGlitch,
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}
