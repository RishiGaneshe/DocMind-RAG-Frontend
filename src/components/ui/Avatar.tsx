import { cn, initials } from '@/lib/utils'

const SIZES = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
} as const

interface AvatarProps {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  size?: keyof typeof SIZES
  className?: string
}

/**
 * Initials only — there is no avatar upload in the API, and a fake gravatar
 * lookup would leak the user's email hash to a third party.
 */
export function Avatar({ firstName, lastName, email, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-accent-wash font-semibold text-accent',
        'border border-accent/25',
        SIZES[size],
        className,
      )}
    >
      {initials(firstName, lastName, email)}
    </span>
  )
}
