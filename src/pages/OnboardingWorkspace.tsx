import { WorkspaceForm } from '@/features/onboarding/components/WorkspaceForm'
import { useDocumentTitle } from '@/hooks'

/**
 * `/onboarding/workspace` — reached straight after signup, and by anyone whose
 * JWT has no `tenantId`. `ProtectedRoute redirectIfTenant="/app"` keeps people
 * who already have a workspace from creating a second one they cannot use.
 */
export default function OnboardingWorkspacePage() {
  useDocumentTitle('Create your workspace')
  return <WorkspaceForm />
}
