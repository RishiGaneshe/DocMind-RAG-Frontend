import { Check, Copy } from 'lucide-react'
import { Link } from 'react-router'
import { Alert, Button, IconButton, Skeleton } from '@/components/ui'
import {
  InfoList,
  InfoRow,
  SettingsSection,
} from '@/features/settings/components/SettingsSection'
import { useTenantDetails } from '@/features/settings/hooks/useTenantDetails'
import { useDocuments, useDocumentStats } from '@/features/documents/hooks/useDocuments'
import { useCopyToClipboard, useDocumentTitle } from '@/hooks'
import { formatBytes, formatDateTime, formatNumber } from '@/lib/utils'

export default function SettingsWorkspacePage() {
  useDocumentTitle('Workspace settings')

  const { tenant, isPending } = useTenantDetails()
  const { documents } = useDocuments()
  const stats = useDocumentStats(documents)
  const { copy, copied } = useCopyToClipboard()

  return (
    <div className="flex flex-col gap-4">
      <SettingsSection
        title="Workspace"
        description="How this workspace is identified by the API."
        footnote="Renaming a workspace or changing its address is not possible yet — the API has no update route, and the address is baked into every stored vector's namespace."
      >
        {isPending && !tenant ? (
          <Skeleton lines={4} />
        ) : tenant ? (
          <InfoList>
            <InfoRow label="Name">{tenant.name}</InfoRow>
            <InfoRow label="Address" mono>
              {tenant.slug}
            </InfoRow>
            <InfoRow
              label="Workspace ID"
              mono
              action={
                <IconButton
                  label={copied ? 'Copied' : 'Copy workspace ID'}
                  icon={copied ? <Check /> : <Copy />}
                  size="sm"
                  onClick={() => void copy(tenant.id)}
                />
              }
            >
              {tenant.id}
            </InfoRow>
            {tenant.createdAt && (
              <InfoRow label="Created">{formatDateTime(tenant.createdAt)}</InfoRow>
            )}
          </InfoList>
        ) : (
          <Alert tone="warning" title="No workspace loaded">
            The workspace could not be read. Reload the page, or sign in again.
          </Alert>
        )}
      </SettingsSection>

      <SettingsSection
        title="What is indexed"
        description="Derived from your document list, not a separate usage endpoint."
      >
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Documents" value={formatNumber(stats.count)} />
          <Stat label="Passages" value={formatNumber(stats.chunks)} />
          <Stat label="Stored" value={formatBytes(stats.bytes)} />
          <Stat
            label="Ready to answer"
            value={`${formatNumber(stats.ready)} of ${formatNumber(stats.count)}`}
          />
        </dl>
        <div>
          <Button asChild variant="secondary" size="sm">
            <Link to="/app/documents">Manage documents</Link>
          </Button>
        </div>
      </SettingsSection>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-line bg-surface-raised p-3">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums text-fg">{value}</dd>
    </div>
  )
}
