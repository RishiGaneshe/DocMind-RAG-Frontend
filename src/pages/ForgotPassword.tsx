import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { useDocumentTitle } from '@/hooks'

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset your password')
  return <ForgotPasswordForm />
}
