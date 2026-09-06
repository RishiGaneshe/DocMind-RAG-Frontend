/* eslint-disable react-refresh/only-export-components -- this file is the route
   table, not a component module: its exports are the router plus the lazy page
   references, so there is no fast-refresh boundary to preserve. */
import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import {
  AppRouteFallback,
  AuthRouteFallback,
  FullPageFallback,
  RouteError,
} from '@/components/feedback'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { MarketingLayout } from '@/components/layout/MarketingLayout'
import { OnboardingLayout } from '@/components/layout/OnboardingLayout'
import { RootLayout } from '@/components/layout/RootLayout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { Skeleton } from '@/components/ui'
import { FEATURES } from '@/lib/constants'

/**
 * The route table (§11).
 *
 * Every leaf is `React.lazy`, so the initial bundle carries the shell and the
 * route the visitor actually asked for — not the chat view, the document library
 * and the settings panes as well. Fallbacks are chosen per area: an auth card
 * skeleton inside the auth shell, a full-page one where no chrome exists yet.
 *
 * `errorElement` is attached at the root so a thrown render error or a stale
 * dynamic import lands on a real page instead of a blank screen.
 */

const Landing = lazy(() => import('./pages/Landing'))
const Pricing = lazy(() => import('./pages/Pricing'))
const LegalPrivacy = lazy(() => import('./pages/LegalPrivacy'))
const LegalTerms = lazy(() => import('./pages/LegalTerms'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const OnboardingWorkspace = lazy(() => import('./pages/OnboardingWorkspace'))
const Chat = lazy(() => import('./pages/Chat'))
const Documents = lazy(() => import('./pages/Documents'))
const DocumentUpload = lazy(() => import('./pages/DocumentUpload'))
const DocumentDetail = lazy(() => import('./pages/DocumentDetail'))
const AppNotFound = lazy(() => import('./pages/AppNotFound'))
const Settings = lazy(() => import('./pages/Settings'))
const SettingsWorkspace = lazy(() => import('./pages/SettingsWorkspace'))
const SettingsApiKeys = lazy(() => import('./pages/SettingsApiKeys'))
const SettingsMembers = lazy(() => import('./pages/SettingsMembers'))
const SettingsAccount = lazy(() => import('./pages/SettingsAccount'))
const Forbidden = lazy(() => import('./pages/Forbidden'))
const NotFound = lazy(() => import('./pages/NotFound'))

/** Wraps a lazy page in the Suspense boundary that suits its shell. */
function authPage(Page: ComponentType) {
  return (
    <Suspense fallback={<AuthRouteFallback />}>
      <Page />
    </Suspense>
  )
}

function fullPage(Page: ComponentType) {
  return (
    <Suspense fallback={<FullPageFallback />}>
      <Page />
    </Suspense>
  )
}

function appPage(Page: ComponentType) {
  return (
    <Suspense fallback={<AppRouteFallback />}>
      <Page />
    </Suspense>
  )
}

/**
 * Modal and drawer routes get no fallback at all: they open over a page that is
 * already there, and a skeleton flashing on top of it reads as a glitch.
 */
function overlayPage(Page: ComponentType) {
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  )
}

/** A settings pane loads beside its rail, so only the pane area is skeletoned. */
function panePage(Page: ComponentType) {
  return (
    <Suspense fallback={<Skeleton lines={5} className="max-w-2xl" />}>
      <Page />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      // ---- Public marketing pages (§10) ----
      {
        element: <MarketingLayout />,
        children: [
          { index: true, element: fullPage(Landing) },
          { path: 'pricing', element: fullPage(Pricing) },
          { path: 'legal/privacy', element: fullPage(LegalPrivacy) },
          { path: 'legal/terms', element: fullPage(LegalTerms) },
        ],
      },

      // ---- Public-only: /login, /signup and the recovery screens (§13) ----
      {
        element: <AuthLayout />,
        children: [
          {
            element: <PublicOnlyRoute fallback={<AuthRouteFallback />} />,
            children: [
              { path: 'login', element: authPage(Login) },
              { path: 'signup', element: authPage(Signup) },
              // Flagged off: the endpoints these need do not exist yet (§13.3).
              // With the flag off, /login shows an honest dialog instead and
              // these paths fall through to the 404.
              ...(FEATURES.passwordReset
                ? [
                    { path: 'forgot-password', element: authPage(ForgotPassword) },
                    { path: 'reset-password', element: authPage(ResetPassword) },
                  ]
                : []),
              { path: 'verify-email', element: authPage(VerifyEmail) },
            ],
          },
        ],
      },

      // ---- Signed in, no workspace yet (§14) ----
      {
        element: (
          <ProtectedRoute
            requireTenant={false}
            redirectIfTenant="/app"
            fallback={<FullPageFallback />}
          />
        ),
        children: [
          {
            element: <OnboardingLayout />,
            children: [{ path: 'onboarding/workspace', element: fullPage(OnboardingWorkspace) }],
          },
        ],
      },

      // ---- The product (§12) ----
      {
        path: 'app',
        element: (
          <ProtectedRoute fallback={<FullPageFallback />}>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: appPage(Chat) },
          {
            path: 'documents',
            element: appPage(Documents),
            children: [
              // Both render over the list, which stays mounted behind them.
              { path: 'upload', element: overlayPage(DocumentUpload) },
              { path: ':documentId', element: overlayPage(DocumentDetail) },
            ],
          },
          {
            path: 'settings',
            element: appPage(Settings),
            children: [
              // The parent renders only chrome, so landing on /app/settings with
              // no pane selected would show an empty rail.
              { index: true, element: <Navigate to="workspace" replace /> },
              { path: 'workspace', element: panePage(SettingsWorkspace) },
              { path: 'api-keys', element: panePage(SettingsApiKeys) },
              { path: 'members', element: panePage(SettingsMembers) },
              { path: 'account', element: panePage(SettingsAccount) },
            ],
          },
          { path: '*', element: appPage(AppNotFound) },
        ],
      },

      { path: '403', element: fullPage(Forbidden) },
      { path: '*', element: fullPage(NotFound) },
    ],
  },
])
