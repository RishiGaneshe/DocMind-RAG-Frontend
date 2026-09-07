import { LogOut, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  Switch,
} from '@/components/ui'
import { useLogout } from '@/features/auth/hooks/useAuthMutations'
import {
  InfoList,
  InfoRow,
  SettingsSection,
} from '@/features/settings/components/SettingsSection'
import { useDocumentTitle } from '@/hooks'
import { formatDateTime } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useUiStore } from '@/stores/uiStore'

export default function SettingsAccountPage() {
  useDocumentTitle('Account')

  const navigate = useNavigate()
  const user = useSessionStore((s) => s.user)
  const logout = useLogout()
  const [confirming, setConfirming] = useState(false)

  const streaming = useUiStore((s) => s.streaming)
  const setStreaming = useUiStore((s) => s.setStreaming)

  return (
    <div className="flex flex-col gap-4">
      <SettingsSection
        title="Account"
        description="Read-only: the API has no route to update a profile."
        footnote="Changing your name, email or password would need endpoints that do not exist yet (PATCH /api/auth/me and a change-password route)."
      >
        <div className="flex items-center gap-3">
          <Avatar
            firstName={user?.firstName}
            lastName={user?.lastName}
            email={user?.email}
            size="lg"
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-fg">
              {user ? `${user.firstName} ${user.lastName}` : '—'}
            </span>
            <span className="truncate text-sm text-fg-muted">{user?.email}</span>
          </div>
        </div>

        <InfoList>
          <InfoRow label="Role">{user?.role === 'owner' ? 'Owner' : 'Member'}</InfoRow>
          {user?.createdAt && <InfoRow label="Joined">{formatDateTime(user.createdAt)}</InfoRow>}
          {user?.lastLoginAt && (
            <InfoRow label="Last sign-in">{formatDateTime(user.lastLoginAt)}</InfoRow>
          )}
          <InfoRow label="User ID" mono>
            {user?.id}
          </InfoRow>
        </InfoList>
      </SettingsSection>

      <SettingsSection
        title="Preferences"
        description="Stored in this browser, not on the server."
      >
        <Switch
          label="Stream answers as they are written"
          hint="Turn this off on a slow connection to receive the whole answer at once."
          labelPosition="left"
          checked={streaming}
          onCheckedChange={setStreaming}
        />
        <p className="text-xs text-fg-muted">
          Animations already follow your system's “reduce motion” setting, so there is no separate
          switch for it.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Session"
        description="Tokens are held in this browser and sent as a bearer header."
      >
        <Alert tone="info" icon={<ShieldCheck className="size-4" />} title="How sign-in is stored">
          Choosing “Keep me signed in” puts the token pair in local storage; otherwise it lives in
          session storage and is gone when the tab closes. Signing out revokes the refresh token on
          the server.
        </Alert>

        <div>
          <Button variant="danger" leftIcon={<LogOut />} onClick={() => setConfirming(true)}>
            Sign out
          </Button>
        </div>
      </SettingsSection>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent
          size="sm"
          title="Sign out of DocMind?"
          description="Your documents stay indexed. The current chat thread is not saved anywhere, so it will be gone."
          footer={
            <>
              <DialogClose asChild>
                <Button variant="secondary" fullWidth>
                  Stay signed in
                </Button>
              </DialogClose>
              <Button
                variant="danger"
                fullWidth
                loading={logout.isPending}
                onClick={() => {
                  logout.mutate(undefined, {
                    onSuccess: () => void navigate('/login', { replace: true }),
                  })
                }}
              >
                Sign out
              </Button>
            </>
          }
        >
          <p className="text-sm text-fg-secondary">
            You will need your email and password to get back in.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
