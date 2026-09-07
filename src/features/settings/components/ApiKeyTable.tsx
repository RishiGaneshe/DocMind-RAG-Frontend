import {
  Activity,
  Copy,
  Ellipsis,
  Globe,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from '@/components/ui'
import { useCopyToClipboard } from '@/hooks'
import { formatNumber, formatRelativeTime } from '@/lib/utils'
import { useRevokeApiKey } from '../hooks/useApiKeys'
import type { ApiKey } from '@/lib/api'

interface ApiKeyTableProps {
  apiKeys: ApiKey[]
  onViewUsage: (key: ApiKey) => void
  onRotate: (key: ApiKey) => void
}

export function ApiKeyTable({ apiKeys, onViewUsage, onRotate }: ApiKeyTableProps) {
  const { copy } = useCopyToClipboard()
  const revokeMutation = useRevokeApiKey()

  const [revokingKey, setRevokingKey] = useState<ApiKey | null>(null)

  const handleRevoke = () => {
    if (!revokingKey) return
    revokeMutation.mutate(revokingKey.id, {
      onSuccess: () => setRevokingKey(null),
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-raised/40 text-xs font-semibold text-fg-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                Key / Name
              </th>
              <th scope="col" className="hidden px-4 py-3 sm:table-cell">
                Type
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="hidden px-4 py-3 md:table-cell">
                Origins
              </th>
              <th scope="col" className="hidden px-4 py-3 lg:table-cell">
                Total Requests
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {apiKeys.map((key) => {
              const isRevoked = key.status === 'revoked'
              const isActive = key.status === 'active'

              return (
                <tr
                  key={key.id}
                  className="transition-colors hover:bg-surface-raised/30"
                >
                  {/* Name & Masked Key */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-fg">{key.name}</span>
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-xs text-fg-secondary">
                          {key.maskedKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            void copy(key.keyPrefix).then((ok) => {
                              if (ok) toast.success('Key prefix copied')
                            })
                          }}
                          className="text-fg-muted hover:text-fg"
                          title="Copy key prefix"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <Badge
                      tone={key.type === 'public' ? 'accent' : 'neutral'}
                      className="capitalize"
                    >
                      {key.type}
                    </Badge>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <Badge
                      tone={isActive ? 'success' : isRevoked ? 'neutral' : 'warning'}
                      className="capitalize"
                    >
                      {key.status}
                    </Badge>
                  </td>

                  {/* Origins */}
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    {key.type === 'secret' ? (
                      <span className="text-xs text-fg-muted">Server-to-server</span>
                    ) : key.unrestricted || key.allowedOrigins.length === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                        <Globe className="size-3" />
                        Unrestricted
                      </span>
                    ) : (
                      <span className="text-xs text-fg-secondary">
                        {key.allowedOrigins.length}{' '}
                        {key.allowedOrigins.length === 1 ? 'origin' : 'origins'}
                      </span>
                    )}
                  </td>

                  {/* Total Requests */}
                  <td className="hidden px-4 py-3.5 font-mono text-xs text-fg-secondary lg:table-cell">
                    {formatNumber(key.totalRequests)}
                    {key.lastUsedAt && (
                      <span className="block text-[10px] text-fg-muted">
                        last used {formatRelativeTime(key.lastUsedAt)}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <IconButton
                          label={`Actions for ${key.name}`}
                          icon={<Ellipsis />}
                          size="sm"
                        />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => onViewUsage(key)}>
                          <Activity aria-hidden="true" />
                          View usage & quotas
                        </DropdownMenuItem>

                        {isActive && (
                          <DropdownMenuItem onSelect={() => onRotate(key)}>
                            <RefreshCw aria-hidden="true" />
                            Rotate key
                          </DropdownMenuItem>
                        )}

                        {isActive && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              tone="danger"
                              onSelect={() => setRevokingKey(key)}
                            >
                              <Trash2 aria-hidden="true" />
                              Revoke key
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={Boolean(revokingKey)} onOpenChange={(open) => !open && setRevokingKey(null)}>
        <DialogContent
          title={`Revoke "${revokingKey?.name}"?`}
          description="Any website or integration authenticating with this key will immediately receive 401 Unauthorized."
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setRevokingKey(null)}
                disabled={revokeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRevoke}
                loading={revokeMutation.isPending}
              >
                Revoke Key
              </Button>
            </>
          }
        >
          <p className="text-sm text-fg-muted">
            This action cannot be undone. Once revoked, a new key must be minted and deployed to
            restore chat access.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
