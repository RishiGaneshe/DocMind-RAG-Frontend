import { LoginForm } from '@/features/auth/components/LoginForm'
import { useDocumentTitle } from '@/hooks'

export default function LoginPage() {
  useDocumentTitle('Sign in')
  return <LoginForm />
}
