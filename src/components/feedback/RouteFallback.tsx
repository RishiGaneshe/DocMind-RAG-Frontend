import { Container, Skeleton, Spinner } from '@/components/ui'

export function RouteFallback() {
  return (
    <Container width="lg" className="flex flex-col gap-6 py-10" aria-busy="true">
      <span className="sr-only" role="status">
        Loading page
      </span>
      <Skeleton className="h-8 w-56" />
      <Skeleton lines={3} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </Container>
  )
}

/** Inside the app shell: the sidebar and topbar are already painted. */
export function AppRouteFallback() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-11 w-full max-w-md" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  )
}

/** The auth card's own footprint, so the glass panel does not pop in. */
export function AuthRouteFallback() {
  return (
    <div className="flex w-full flex-col gap-5" aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton lines={2} />
      <Skeleton className="h-11" />
      <Skeleton className="h-11" />
      <Skeleton className="h-11 w-full" />
    </div>
  )
}

/**
 * The last resort — used only where no layout is known yet (the very first
 * paint of the router). Announced politely so it is not silent to a screen
 * reader.
 */
export function FullPageFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg-base">
      <div className="flex flex-col items-center gap-3" role="status">
        <Spinner size="lg" />
        <p className="text-sm text-fg-muted">Loading DocMind…</p>
      </div>
    </div>
  )
}
