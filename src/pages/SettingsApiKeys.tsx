import { KeyRound, Plus, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from '@/components/ui'
import { ApiKeyCreateModal } from '@/features/settings/components/ApiKeyCreateModal'
import { ApiKeyRotateModal } from '@/features/settings/components/ApiKeyRotateModal'
import { ApiKeyTable } from '@/features/settings/components/ApiKeyTable'
import { ApiKeyUsageModal } from '@/features/settings/components/ApiKeyUsageModal'
import { useApiKeysList } from '@/features/settings/hooks/useApiKeys'
import { useDocumentTitle } from '@/hooks'
import type { ApiKey } from '@/lib/api'

/**
 * `/app/settings/api-keys` — Developers & API Keys Management.
 *
 * Mints publishable keys for embeddable chat widgets and secret keys for
 * backend integrations. Full CRUD, usage tracking, zero-downtime rotation,
 * and origin enforcement.
 */
export default function SettingsApiKeysPage() {
  useDocumentTitle('API Keys')

  const { data, isPending, isError, error, refetch } = useApiKeysList()
  const apiKeys = data?.apiKeys ?? []

  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [rotatingKey, setRotatingKey] = useState<ApiKey | null>(null)
  const [usageKey, setUsageKey] = useState<ApiKey | null>(null)

  const filteredKeys = useMemo(() => {
    if (filter === 'active') return apiKeys.filter((k) => k.status === 'active')
    if (filter === 'revoked') return apiKeys.filter((k) => k.status === 'revoked' || k.status === 'expired')
    return apiKeys
  }, [apiKeys, filter])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-fg">API Keys</h2>
          <p className="text-sm text-fg-muted">
            Manage public keys for your embeddable chat widget and secret keys for integrations.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus />}>
          Create API Key
        </Button>
      </div>

      {/* Security Banner */}
      <Alert
        tone="info"
        icon={<ShieldCheck className="size-5 text-accent" />}
        title="Publishable vs Secret Keys"
      >
        Use <code className="font-mono text-xs font-semibold">pk_live_</code> keys on customer
        websites. They are origin-checked and rate-limited. Keep{' '}
        <code className="font-mono text-xs font-semibold">sk_live_</code> keys on your backend only.
      </Alert>

      {/* Content */}
      {isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton lines={4} />
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load API keys"
          description={error?.message || 'Failed to fetch keys for this workspace.'}
          onRetry={() => void refetch()}
        />
      ) : apiKeys.length === 0 ? (
        <EmptyState
          icon={<KeyRound />}
          title="No API keys minted yet"
          description="Create a public API key to drop your document-grounded chat widget into your website."
          secondaryAction={
            <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus />}>
              Create API Key
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-accent-wash text-accent'
                    : 'text-fg-secondary hover:bg-surface-raised hover:text-fg'
                }`}
              >
                All ({apiKeys.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('active')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-accent-wash text-accent'
                    : 'text-fg-secondary hover:bg-surface-raised hover:text-fg'
                }`}
              >
                Active ({apiKeys.filter((k) => k.status === 'active').length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('revoked')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === 'revoked'
                    ? 'bg-accent-wash text-accent'
                    : 'text-fg-secondary hover:bg-surface-raised hover:text-fg'
                }`}
              >
                Revoked ({apiKeys.filter((k) => k.status === 'revoked' || k.status === 'expired').length})
              </button>
            </div>

            <span className="text-xs text-fg-muted font-mono">
              {apiKeys.length} / {data?.defaults?.maxKeysPerTenant ?? 25} keys
            </span>
          </div>

          <ApiKeyTable
            apiKeys={filteredKeys}
            onViewUsage={(key) => setUsageKey(key)}
            onRotate={(key) => setRotatingKey(key)}
          />
        </div>
      )}

      {/* Modals */}
      <ApiKeyCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaults={data?.defaults}
        availableScopes={data?.scopes}
      />

      <ApiKeyRotateModal
        apiKey={rotatingKey}
        open={Boolean(rotatingKey)}
        onOpenChange={(open) => !open && setRotatingKey(null)}
      />

      <ApiKeyUsageModal
        apiKey={usageKey}
        open={Boolean(usageKey)}
        onOpenChange={(open) => !open && setUsageKey(null)}
      />
    </div>
  )
}
