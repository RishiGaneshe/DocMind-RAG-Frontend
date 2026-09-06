import { useQuery } from '@tanstack/react-query'
import { getMyTenant } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { useSessionStore, useTenantId } from '@/stores/sessionStore'

/**
 * `GET /api/tenants/me`.
 *
 * The session store already holds a `Tenant`, but only the copy that came back
 * from sign-in — which for a login response has no `apiKey`. The API key pane
 * needs this request; everything else can read the store.
 */
export function useTenantDetails() {
  const tenantId = useTenantId()
  const fallback = useSessionStore((s) => s.tenant)

  const query = useQuery({
    queryKey: queryKeys.tenant.me,
    queryFn: ({ signal }) => getMyTenant(signal),
    enabled: Boolean(tenantId),
  })

  return {
    ...query,
    /** The freshest copy available — never blank while the request is in flight. */
    tenant: query.data ?? fallback,
  }
}
