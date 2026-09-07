import { Check } from 'lucide-react'
import { Outlet } from 'react-router'
import { Logo } from '@/components/brand'
import { FadeIn, OrbBackdrop } from '@/components/motion'

const PROOF_POINTS = [
  'Every answer cites the exact chunk it came from',
  'Workspaces are isolated at the vector level, not by a filter',
  'Streamed responses, so you read while it thinks',
]

export function AuthLayout() {
  return (
    <div className="relative min-h-dvh overflow-y-auto bg-bg-base lg:grid lg:grid-cols-[3fr_2fr]">
      <OrbBackdrop />

      {/* Brand panel — decorative reassurance, hidden below lg where the
          viewport belongs to the form. */}
      <aside className="relative hidden flex-col justify-between p-10 lg:flex xl:p-14">
        <Logo to="/" />

        <div className="flex max-w-xl flex-col gap-8">
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight text-fg text-balance xl:text-5xl">
            Ask your documents anything.
            <span className="text-accent"> Get answers you can verify.</span>
          </h2>

          <ul className="flex flex-col gap-4">
            {PROOF_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-base text-fg-secondary">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-wash text-accent"
                >
                  <Check className="size-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-fg-muted">
          Multi-tenant retrieval-augmented generation, running on your own documents.
        </p>
      </aside>

      {/* Form column */}
      <main
        id="main"
        className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6 lg:min-h-full"
      >
        {/* Below lg the brand panel collapses to the mark alone. */}
        <Logo to="/" markOnly className="lg:hidden" />

        <FadeIn className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-line bg-surface-glass p-6 shadow-lg backdrop-blur-2xl sm:p-8">
            <Outlet />
          </div>
        </FadeIn>
      </main>
    </div>
  )
}
