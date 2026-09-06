import { SignupForm } from '@/features/auth/components/SignupForm'
import { useDocumentTitle } from '@/hooks'

export default function SignupPage() {
  useDocumentTitle('Create your account')
  return <SignupForm />
}
