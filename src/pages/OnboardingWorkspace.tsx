import { WorkspaceForm } from '@/features/onboarding/components/WorkspaceForm'
import { useDocumentTitle } from '@/hooks'

export default function OnboardingWorkspacePage() {
  useDocumentTitle('Create your workspace')
  return <WorkspaceForm />
}
