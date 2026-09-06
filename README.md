# DocMind — frontend

The React single-page app for DocMind. It is a **standalone project**: it holds
no server code and talks to the DocMind API entirely over HTTP, so it builds and
deploys on its own (static host, CDN, container — anything that can serve
`dist/`). The Express API lives in a separate repo/folder.

## Stack

- **Vite 8** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** — semantic utilities only (`bg-surface`, `text-fg-muted`,
  `border-line`, …), driven by tokens in `src/styles/theme.css`
- **React Router v8** (`createBrowserRouter`, lazy route leaves)
- **TanStack Query v5** for server state, **Zustand v5** for session/UI state
- **Radix UI** primitives, **Motion** for animation, **lucide-react** icons
- **react-hook-form** + **zod** for forms

## Scripts

```bash
npm run dev       # Vite dev server (default :5173)
npm run build     # tsc -b && vite build → dist/
npm run preview   # serve the built dist/ (default :4173)
npm run lint      # eslint .
npm run format    # prettier --write src
npm run test      # vitest run
npm run e2e        # playwright test
```

## Connecting to the API

The client reaches the backend through a single base URL, `VITE_API_BASE_URL`
(see `.env.example`).

- **Development:** leave it as `/api`. The Vite dev server proxies `/api` to the
  backend at `VITE_PROXY_TARGET` (default `http://localhost:4500`), so there is
  no CORS to configure locally.
- **Production (separate origins):** set `VITE_API_BASE_URL` to the backend's
  full origin, e.g. `https://api.example.com/api`. Because the frontend then
  calls the API cross-origin, the **backend must allow this app's origin** — set
  `FRONTEND_ORIGIN` on the server to wherever this build is hosted.

Auth uses bearer tokens sent in the `Authorization` header (no cookies cross the
origin boundary), so no `credentials`/cookie CORS setup is required.

## Path alias

`@/` resolves to `src/` (configured in both `tsconfig` and `vite.config.ts`).
Import as `@/components/ui`, `@/features/auth/...`, etc.

## Layout

```
src/
  components/   # shared UI (ui/, layout/, brand/, feedback/, motion/)
  features/     # auth, chat, documents, onboarding, settings, marketing
  pages/        # one default-export component per route leaf
  hooks/        # cross-cutting hooks (useDocumentTitle, useMediaQuery, …)
  lib/          # api client, constants, utils, tokenStorage
  styles/       # theme.css (tokens) + globals
  routes.tsx    # the route table
```

## Auth token storage

Access/refresh tokens live in browser storage for this phase, confined to
`src/lib/tokenStorage.ts`. Moving to httpOnly cookies later is meant to be a
change to that one module.

## Known backend gaps (surfaced in the UI, not hidden)

The API has no endpoint yet for: deleting a document, fetching a single
document, renaming a workspace, editing a profile, listing/inviting members, or
rotating the workspace API key. Each place a user would expect one names the gap
instead of faking it.

## Assets

The social preview image is `public/og-image.svg`. Some scrapers only read
raster `og:image`; exporting a PNG alongside it is a known follow-up.
"# DocMind-RAG-Frontend" 
