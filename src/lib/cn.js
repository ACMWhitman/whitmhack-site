import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names and resolve conflicting Tailwind utility
 * classes (e.g. "px-2" vs "px-4") in favor of the one that appears last.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
