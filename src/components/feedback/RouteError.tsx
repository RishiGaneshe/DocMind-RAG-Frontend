import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'
import { Home, RotateCw } from 'lucide-react'
import { Button, Container } from '@/components/ui'
import { Logo } from '@/components/brand'
import { ApiError } from '@/lib/api'

/**
 * The router's `errorElement`.
 *
 * A thrown render error, a failed lazy chunk, or a 404 from a data route all
 * land here. It never shows a stack trace in production — only in dev, where it
 * is the fastest way to find the problem.
 */

function describe(error: unknown): { title: string; description: string; detail?: string } {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        title: 'Page not found',
        description: 'The page you were looking for does not exist or has moved.',
      }
    }
    return {
      title: `${error.status} ${error.statusText}`,
      description: 'That request could not be completed.',
      detail: typeof error.data === 'string' ? error.data : undefined,
    }
  }

  if (error instanceof ApiError) {
    return {
      title: error.isNetworkError ? 'Cannot reach the server' : 'Something went wrong',
      description: error.message,
      detail: error.code,
    }
  }

  // A failed dynamic import — almost always a stale tab after a deploy.
  if (error instanceof Error && /dynamically imported module|Importing a module/i.test(error.message)) {
    return {
      title: 'This page needs a refresh',
      description:
        'The app was updated while this tab was open, so part of it could not be loaded. Reloading fixes it.',
      detail: error.message,
    }
  }

  return {
    title: 'Something went wrong',
    description: 'An unexpected error occurred while rendering this page.',
    detail: error instanceof Error ? (error.stack ?? error.message) : undefined,
  }
}

export function RouteError() {
  const error = useRouteError()
  const navigate = useNavigate()
  const { title, description, detail } = describe(error)

  // Surface the stack in development only; users get the plain message.
  const showDetail = import.meta.env.DEV && detail

  return (
    <div className="grid min-h-dvh place-items-center bg-bg-base py-16">
      <Container width="md" className="flex flex-col items-center gap-6 text-center">
        <Logo className="h-8" />

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-fg">{title}</h1>
          <p className="text-base text-fg-secondary text-pretty">{description}</p>
        </div>

        {showDetail && (
          <pre className="max-h-64 w-full overflow-auto rounded-lg border border-line bg-surface p-4 text-left font-mono text-xs text-fg-muted">
            {detail}
          </pre>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button leftIcon={<RotateCw />} onClick={() => window.location.reload()}>
            Reload the page
          </Button>
          <Button variant="secondary" leftIcon={<Home />} onClick={() => void navigate('/')}>
            Back to home
          </Button>
        </div>
      </Container>
    </div>
  )
}
