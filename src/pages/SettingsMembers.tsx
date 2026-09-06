import { Crown, Mail, UserPlus } from 'lucide-react'
import { Alert, Avatar, Badge, Button } from '@/components/ui'
import { SettingsSection } from '@/features/settings/components/SettingsSection'
import { useDocumentTitle } from '@/hooks'
import { formatDateTime } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'

/**
 * `/app/settings/members` — you, and an honest gap.
 *
 * The data model supports several users per tenant (`User.tenantId`, and a role
 * of owner or member), but there is no endpoint that lists them and none that
 * invites anyone. So this pane shows the one member it can prove exists — the
 * signed-in user — and says plainly that inviting is not wired up, rather than
 * offering a form that would 404.
 */
export default function SettingsMembersPage() {
  useDocumentTitle('Members')

  const user = useSessionStore((s) => s.user)

  return (
    <SettingsSection
      title="Members"
      description="Everyone with access to this workspace."
      footnote="Roles come from the JWT. An owner created the workspace; members are added by an owner."
    >
      {user ? (
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-3 rounded-lg border border-line bg-surface-raised p-3">
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              size="md"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-fg">
                {user.firstName} {user.lastName}{' '}
                <span className="font-normal text-fg-muted">(you)</span>
              </span>
              <span className="truncate text-xs text-fg-muted">{user.email}</span>
            </div>
            <Badge tone={user.role === 'owner' ? 'accent' : 'neutral'}>
              {user.role === 'owner' && <Crown aria-hidden="true" className="size-3" />}
              {user.role === 'owner' ? 'Owner' : 'Member'}
            </Badge>
          </li>
        </ul>
      ) : null}

      {user?.lastLoginAt && (
        <p className="text-xs text-fg-muted">Last signed in {formatDateTime(user.lastLoginAt)}.</p>
      )}

      <Alert tone="info" icon={<Mail className="size-4" />} title="Invites are not available yet">
        There is no endpoint to list or invite members, so this list can only show your own account.
        A second person can join today by signing up and being added to the workspace directly in the
        database.
      </Alert>

      {/* Not wrapped in a Tooltip: a disabled button emits no pointer events, so
          the tip would never open. The Alert above carries the reason instead. */}
      <div>
        <Button variant="secondary" size="sm" disabled leftIcon={<UserPlus />}>
          Invite a member
        </Button>
      </div>
    </SettingsSection>
  )
}
