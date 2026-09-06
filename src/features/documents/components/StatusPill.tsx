import { CheckCircle2, CircleDashed, Loader2, TriangleAlert } from 'lucide-react'
import { Pill } from '@/components/ui'
import type { DocumentStatus } from '@/lib/api'
import type { Tone } from '@/components/ui'

/**
 * The four values of `Document.status` in src/models/Document.js, mapped to a
 * tone and a plain-language label. PROCESSING is the only one that animates,
 * and only its icon — a whole spinning row is noise in a long list.
 */
const STATUS: Record<DocumentStatus, { label: string; tone: Tone; icon: React.ReactNode }> = {
  PENDING: { label: 'Queued', tone: 'neutral', icon: <CircleDashed /> },
  PROCESSING: { label: 'Processing', tone: 'accent', icon: <Loader2 className="animate-spin" /> },
  COMPLETED: { label: 'Ready', tone: 'success', icon: <CheckCircle2 /> },
  FAILED: { label: 'Failed', tone: 'error', icon: <TriangleAlert /> },
}

interface StatusPillProps {
  status: DocumentStatus
  size?: 'sm' | 'md'
  className?: string
}

export function StatusPill({ status, size = 'sm', className }: StatusPillProps) {
  const { label, tone, icon } = STATUS[status]

  return (
    <Pill tone={tone} size={size} icon={icon} className={className}>
      {label}
    </Pill>
  )
}

/** Used by the filter control so the labels cannot drift from the pills. */
export const STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING: STATUS.PENDING.label,
  PROCESSING: STATUS.PROCESSING.label,
  COMPLETED: STATUS.COMPLETED.label,
  FAILED: STATUS.FAILED.label,
}
