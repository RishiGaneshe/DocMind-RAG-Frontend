/** Human-readable byte size. Binary units, one decimal place above KB. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** i
  return `${value.toFixed(i === 0 ? 0 : decimals).replace(/\.0$/, '')} ${units[i]}`
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['week', 1000 * 60 * 60 * 24 * 7],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
]

/**
 * "3 minutes ago" / "in 2 days". Falls back to an absolute date beyond a year
 * so long-lived documents do not read as "13 months ago".
 */
export function formatRelativeTime(input: string | number | Date, now: Date = new Date()): string {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return '—'

  const diff = date.getTime() - now.getTime()
  const abs = Math.abs(diff)

  if (abs < 45_000) return 'just now'

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (abs >= ms) {
      if (unit === 'year') return formatDate(date)
      return rtf.format(Math.round(diff / ms), unit)
    }
  }
  return rtf.format(Math.round(diff / 1000), 'second')
}

/** "12 Mar 2025" — unambiguous across locales, no time-of-day noise. */
export function formatDate(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** "12 Mar 2025, 14:03" — used in document detail where precision matters. */
export function formatDateTime(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Thousands separators for chunk counts and the like. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

/** 0.8123 → "81%". Relevance scores are always shown as whole percentages. */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/** Truncate on a word boundary where possible, with a real ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`
}

/** "report.pdf" → "report" — filenames are shown without the extension noise. */
export function stripExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot > 0 ? filename.slice(0, dot) : filename
}

/** Two-letter initials for the avatar fallback. */
export function initials(first?: string | null, last?: string | null, email?: string | null): string {
  const a = first?.trim()?.[0] ?? ''
  const b = last?.trim()?.[0] ?? ''
  const joined = `${a}${b}`.toUpperCase()
  if (joined) return joined
  return (email?.trim()?.[0] ?? '?').toUpperCase()
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Validates if a string is a standard 36-character UUIDv4 / UUIDv7. */
export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value)
}
