import { Skeleton } from '@/components/ui'
import {
  ApiKeyField,
  ApiKeyNotice,
  ApiKeyUnavailable,
} from '@/features/settings/components/ApiKeyField'
import { SettingsSection } from '@/features/settings/components/SettingsSection'
import { useTenantDetails } from '@/features/settings/hooks/useTenantDetails'
import { useDocumentTitle } from '@/hooks'

/**
 * `/app/settings/api-keys` — one key, masked.
 *
 * `apiKey` is optional on the tenant schema because the login response omits it;
 * only `/auth/me` and `/tenants/me` include it. When it is absent this pane says
 * so and offers a refetch rather than rendering an empty box.
 */
export default function SettingsApiKeysPage() {
  useDocumentTitle('API key')

  const { tenant, isPending, refetch } = useTenantDetails()

  return (
    <SettingsSection
      title="API key"
      description="Use it as the x-api-key header for server-to-server calls that are not signed in as a user."
      footnote="Requests authenticated with this key act on this workspace only — it cannot read another workspace's documents."
    >
      {isPending && !tenant?.apiKey ? (
        <Skeleton lines={2} />
      ) : tenant?.apiKey ? (
        <>
          <ApiKeyField apiKey={tenant.apiKey} />
          <ApiKeyNotice />
        </>
      ) : (
        <ApiKeyUnavailable onRetry={() => void refetch()} />
      )}
    </SettingsSection>
  )
}
