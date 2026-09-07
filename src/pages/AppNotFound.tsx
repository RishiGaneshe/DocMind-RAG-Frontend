import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { Button, Container, EmptyState } from '@/components/ui'
import { useDocumentTitle } from '@/hooks'

export default function AppNotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <Container width="md" className="py-10">
      <EmptyState
        icon={<Compass />}
        title="That page does not exist"
        description="The link may be out of date. Your documents and chat are unaffected."
        secondaryAction={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/app">Back to chat</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/app/documents">Documents</Link>
            </Button>
          </div>
        }
      />
    </Container>
  )
}
