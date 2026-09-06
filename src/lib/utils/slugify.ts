/**
 * Slugify a workspace name into the shape the backend accepts.
 *
 * The API validates against `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` (2–60 chars), so
 * the client mirrors that exactly: lowercase, ASCII-fold what we can, collapse
 * everything else into single hyphens, and never leave a leading/trailing one.
 */
export function slugify(input: string, maxLength = 60): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')
}

/** Mirrors the backend's slug rule so the form can validate without a round trip. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return slug.length >= 2 && slug.length <= 60 && SLUG_PATTERN.test(slug)
}
