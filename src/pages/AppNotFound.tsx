import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { Button, Container, EmptyState } from '@/components/ui'
import { useDocumentTitle } from '@/hooks'

/**
 * `/app/*` — the 404 that keeps the shell (§11).
 *
 * A signed-in user who mistypes a URL should not be thrown out to the marketing
 * 404: the sidebar, their documents and the composer are all still valid, and
 * losing them makes a typo feel like a crash.
 */
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
