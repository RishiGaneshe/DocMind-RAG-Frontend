import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'
import { useDocumentTitle } from '@/hooks'

export default function ResetPasswordPage() {
  useDocumentTitle('Choose a new password')
  return <ResetPasswordForm />
}
