import { Activity, Globe, Shield } from 'lucide-react'
import {
  Badge,
  Dialog,
  DialogContent,
  Progress,
  Separator,
  Skeleton,
} from '@/components/ui'
import { formatNumber, formatRelativeTime } from '@/lib/utils'
import { useApiKeyUsage } from '../hooks/useApiKeys'
import type { ApiKey } from '@/lib/api'

interface ApiKeyUsageModalProps {
  apiKey: ApiKey | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiKeyUsageModal({ apiKey, open, onOpenChange }: ApiKeyUsageModalProps) {
  const { data: usage, isPending } = useApiKeyUsage(apiKey?.id ?? null)

  if (!apiKey) return null

  const dailyQuota = usage?.dailyQuotaEffective ?? apiKey.dailyQuota ?? 500
  const todayUsed = usage?.todayUsed ?? 0
  const rateLimit = usage?.rateLimitEffective ?? apiKey.rateLimitPerMinute ?? 30
  const percent = Math.min(100, Math.round((todayUsed / dailyQuota) * 100))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={`Usage Analytics: ${apiKey.name}`}
        description={`Metrics and quota status for ${apiKey.maskedKey}`}
        size="md"
      >
        <div className="flex flex-col gap-5 py-2">
          {isPending && !usage ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton lines={4} />
            </div>
          ) : (
            <>
              {/* Daily Quota Card */}
              <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface-raised p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-fg">
                    <Activity className="size-4 text-accent" />
                    Today's Messages
                  </span>
                  <span className="font-mono text-xs text-fg-muted">
                    {usage?.todayUsed !== null && usage?.todayUsed !== undefined ? (
                      `${formatNumber(todayUsed)} / ${formatNumber(dailyQuota)} (${percent}%)`
                    ) : (
                      'Quota store unavailable'
                    )}
                  </span>
                </div>

                <Progress
                  value={percent}
                  tone={percent > 90 ? 'error' : 'accent'}
                  label="Daily quota usage"
                />

                <span className="text-xs text-fg-muted">
                  Daily quota resets at 00:00 UTC. Unused capacity does not roll over.
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-line bg-surface-raised/40 p-3">
                  <span className="text-xs text-fg-muted">Rate Limit</span>
                  <p className="mt-1 font-mono text-sm font-semibold text-fg">
                    {rateLimit} / min
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-surface-raised/40 p-3">
                  <span className="text-xs text-fg-muted">Total Requests</span>
                  <p className="mt-1 font-mono text-sm font-semibold text-fg">
                    {formatNumber(apiKey.totalRequests)}
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-surface-raised/40 p-3">
                  <span className="text-xs text-fg-muted">Last Used</span>
                  <p className="mt-1 text-sm text-fg">
                    {apiKey.lastUsedAt ? formatRelativeTime(apiKey.lastUsedAt) : 'Never'}
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-surface-raised/40 p-3">
                  <span className="text-xs text-fg-muted">Status</span>
                  <p className="mt-1 text-sm capitalize text-fg">
                    <Badge
                      tone={
                        apiKey.status === 'active'
                          ? 'success'
                          : apiKey.status === 'revoked'
                            ? 'neutral'
                            : 'warning'
                      }
                    >
                      {apiKey.status}
                    </Badge>
                  </p>
                </div>
              </div>

              <Separator />

              {/* Allowed Origins */}
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-fg-muted">
                  <Globe className="size-3.5" />
                  Allowed Origins
                </span>
                {apiKey.unrestricted || apiKey.allowedOrigins.length === 0 ? (
                  <p className="text-sm text-warning font-medium">
                    Unrestricted — calls permitted from any origin or tool.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {apiKey.allowedOrigins.map((origin) => (
                      <li
                        key={origin}
                        className="rounded border border-line bg-surface-raised px-2 py-0.5 font-mono text-xs text-fg"
                      >
                        {origin}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Scopes */}
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-fg-muted">
                  <Shield className="size-3.5" />
                  Granted Capabilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {apiKey.scopes.map((scope) => (
                    <Badge key={scope} tone="neutral" className="font-mono text-xs">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
