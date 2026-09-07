/* eslint-disable react-refresh/only-export-components */
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
const SettingsWidget = lazy(() => import('./pages/SettingsWidget'))
const SettingsMembers = lazy(() => import('./pages/SettingsMembers'))
const SettingsAccount = lazy(() => import('./pages/SettingsAccount'))
const Forbidden = lazy(() => import('./pages/Forbidden'))
const NotFound = lazy(() => import('./pages/NotFound'))

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

function overlayPage(Page: ComponentType) {
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  )
}

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
      {
        element: <MarketingLayout />,
        children: [
          { index: true, element: fullPage(Landing) },
          { path: 'pricing', element: fullPage(Pricing) },
          { path: 'legal/privacy', element: fullPage(LegalPrivacy) },
          { path: 'legal/terms', element: fullPage(LegalTerms) },
        ],
      },

      {
        element: <AuthLayout />,
        children: [
          {
            element: <PublicOnlyRoute fallback={<AuthRouteFallback />} />,
            children: [
              { path: 'login', element: authPage(Login) },
              { path: 'signup', element: authPage(Signup) },
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
              { path: 'upload', element: overlayPage(DocumentUpload) },
              { path: ':documentId', element: overlayPage(DocumentDetail) },
            ],
          },
          {
            path: 'settings',
            element: appPage(Settings),
            children: [
              { index: true, element: <Navigate to="workspace" replace /> },
              { path: 'workspace', element: panePage(SettingsWorkspace) },
              { path: 'api-keys', element: panePage(SettingsApiKeys) },
              { path: 'widget', element: panePage(SettingsWidget) },
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
