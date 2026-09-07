import { Link } from 'react-router'
import { Alert, Button } from '@/components/ui'
import { AuthCard, AuthFooterLink } from '@/features/auth/components/AuthCard'
import { useDocumentTitle } from '@/hooks'

export default function VerifyEmailPage() {
  useDocumentTitle('Email verification')

  return (
    <AuthCard
      title="No verification needed"
      description="Your account is already active."
      footer={<AuthFooterLink prompt="Need something else?" to="/login" label="Go to sign in" />}
    >
      <Alert tone="info" title="This deployment does not gate access on email confirmation">
        If you followed a verification link, you can ignore it. Sign in and start uploading
        documents.
      </Alert>
      <Button asChild size="lg" fullWidth>
        <Link to="/login">Continue to sign in</Link>
      </Button>
    </AuthCard>
  )
}
