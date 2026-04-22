/*
  UTILITY FUNCTIONS — Rialo Signal
  ==================================
  Small helper functions used across multiple components.
  Keep these pure (no side effects, no state).
*/

/**
 * Format a number as currency
 * e.g. 67420 → "$67,420"  |  1840000000 → "$1.84B"
 */
export function formatPrice(value, prefix = '$') {
  if (value === null || value === undefined) return '—'
  if (value >= 1e12) return `${prefix}${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9)  return `${prefix}${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6)  return `${prefix}${(value / 1e6).toFixed(2)}M`
  if (value >= 1000) return `${prefix}${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (value < 1)     return `${prefix}${value.toFixed(6)}`
  return `${prefix}${value.toFixed(2)}`
}

/**
 * Format a percentage change with sign
 * e.g. 2.4 → "+2.40%"  |  -1.2 → "-1.20%"
 */
export function formatChange(value) {
  if (value === null || value === undefined) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/**
 * Return a CSS class name based on whether a value is positive/negative
 */
export function changeClass(value) {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'muted'
}

/**
 * Map a signal value (0-1) to a color
 */
export function signalColor(value) {
  if (value >= 0.75) return 'var(--danger)'
  if (value >= 0.55) return 'var(--warn)'
  return 'var(--accent)'
}

/**
 * Map a signal value (0-1) to a CSS class
 */
export function signalClass(value) {
  if (value >= 0.75) return 'down'
  if (value >= 0.55) return 'warn'
  return 'up'
}

/**
 * Map risk score (0-100) to color
 */
export function riskColor(score) {
  if (score >= 75) return 'var(--danger)'
  if (score >= 50) return 'var(--warn)'
  if (score >= 30) return 'var(--info)'
  return 'var(--accent)'
}

/**
 * Shorten a wallet address for display
 * e.g. 0x1234567890abcdef → 0x1234...cdef
 */
export function shortAddress(address) {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Format a large number with K/M/B suffixes
 * e.g. 1840000000 → "1.84B"
 */
export function formatCompact(value) {
  if (!value) return '0'
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  return String(value)
}
