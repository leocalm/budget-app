import { lazy, ReactElement, Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';
import { ProtectedRoute } from './components/Auth';
import { PageLoader } from './components/Utils';
import { AuthProvider } from './context/AuthContext';
import { BudgetProvider } from './context/BudgetContext';
import { EncryptionProvider } from './context/EncryptionContext';
import { V2ThemeProvider } from './theme/v2';

const V2AppShell = lazy(() =>
  import('./components/v2/AppShell/V2AppShell').then((module) => ({
    default: module.V2AppShell,
  }))
);
const PlaceholderPage = lazy(() =>
  import('./pages/v2/Placeholder.page').then((module) => ({
    default: module.PlaceholderPage,
  }))
);
const DashboardV2Page = lazy(() =>
  import('./pages/v2/Dashboard.page').then((module) => ({
    default: module.DashboardV2Page,
  }))
);
const SettingsV2Page = lazy(() =>
  import('./pages/v2/Settings.page').then((module) => ({
    default: module.SettingsV2Page,
  }))
);
const AccountsV2Page = lazy(() =>
  import('./pages/v2/Accounts.page').then((module) => ({
    default: module.AccountsV2Page,
  }))
);
const AccountDetailV2Page = lazy(() =>
  import('./pages/v2/AccountDetail.page').then((module) => ({
    default: module.AccountDetailV2Page,
  }))
);
const PeriodsV2Page = lazy(() =>
  import('./pages/v2/Periods.page').then((module) => ({
    default: module.PeriodsV2Page,
  }))
);
const VendorsV2Page = lazy(() =>
  import('./pages/v2/Vendors.page').then((module) => ({
    default: module.VendorsV2Page,
  }))
);
const VendorDetailV2Page = lazy(() =>
  import('./pages/v2/VendorDetail.page').then((module) => ({
    default: module.VendorDetailV2Page,
  }))
);
const CategoriesV2Page = lazy(() =>
  import('./pages/v2/Categories.page').then((module) => ({
    default: module.CategoriesV2Page,
  }))
);
const CategoryDetailV2Page = lazy(() =>
  import('./pages/v2/CategoryDetail.page').then((module) => ({
    default: module.CategoryDetailV2Page,
  }))
);
const TargetsV2Page = lazy(() =>
  import('./pages/v2/Targets.page').then((module) => ({
    default: module.TargetsV2Page,
  }))
);
const TransactionsV2Page = lazy(() =>
  import('./pages/v2/Transactions.page').then((module) => ({
    default: module.TransactionsV2Page,
  }))
);
const SubscriptionsV2Page = lazy(() =>
  import('./pages/v2/Subscriptions.page').then((module) => ({
    default: module.SubscriptionsV2Page,
  }))
);
const SubscriptionDetailV2Page = lazy(() =>
  import('./pages/v2/SubscriptionDetail.page').then((module) => ({
    default: module.SubscriptionDetailV2Page,
  }))
);
const OnboardingV2Page = lazy(() =>
  import('./pages/v2/Onboarding.page').then((module) => ({
    default: module.OnboardingV2Page,
  }))
);
const ServerErrorPage = lazy(() =>
  import('./pages/ServerError.page').then((module) => ({
    default: module.ServerErrorPage,
  }))
);
const AccessDeniedPage = lazy(() =>
  import('./pages/AccessDenied.page').then((module) => ({
    default: module.AccessDeniedPage,
  }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFound.page').then((module) => ({
    default: module.NotFoundPage,
  }))
);

// Auth pages
const V2AuthLayoutComponent = lazy(() =>
  import('./components/v2/Auth').then((m) => ({ default: m.V2AuthLayout }))
);
const V2LoginPageComponent = lazy(() =>
  import('./components/v2/Auth').then((m) => ({ default: m.V2LoginPage }))
);
const V2RegisterPageComponent = lazy(() =>
  import('./components/v2/Auth').then((m) => ({ default: m.V2RegisterPage }))
);
const V2ForgotPasswordPageComponent = lazy(() =>
  import('./components/v2/Auth').then((m) => ({ default: m.V2ForgotPasswordPage }))
);
const V2ResetPasswordPageComponent = lazy(() =>
  import('./components/v2/Auth').then((m) => ({ default: m.V2ResetPasswordPage }))
);
const V2UnlockAccountPageComponent = lazy(() =>
  import('./components/v2/Auth').then((m) => ({ default: m.V2UnlockAccountPage }))
);
const V2Emergency2FADisablePageComponent = lazy(() =>
  import('./components/v2/Auth').then((m) => ({ default: m.V2Emergency2FADisablePage }))
);

const SessionUnlockGateLazy = lazy(() =>
  import('./components/v2/Auth').then((m) => ({ default: m.SessionUnlockGate }))
);

const V2Layout = () => {
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const h1 = document.querySelector('h1');
    if (h1) {
      if (!h1.hasAttribute('tabindex')) {
        h1.setAttribute('tabindex', '-1');
      }
      h1.focus();
    }
  }, [location.pathname]);

  return (
    <ProtectedRoute>
      <SessionUnlockGateLazy>
        <BudgetProvider>
          <V2ThemeProvider colorMode={colorScheme === 'dark' ? 'dark' : 'light'}>
            <V2AppShell />
          </V2ThemeProvider>
        </BudgetProvider>
      </SessionUnlockGateLazy>
    </ProtectedRoute>
  );
};

const withPageLoader = (element: ReactElement) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export function Router() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: withPageLoader(<V2Layout />),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: withPageLoader(<DashboardV2Page />) },
        { path: 'transactions', element: withPageLoader(<TransactionsV2Page />) },
        { path: 'accounts', element: withPageLoader(<AccountsV2Page />) },
        { path: 'accounts/:id', element: withPageLoader(<AccountDetailV2Page />) },
        { path: 'categories', element: withPageLoader(<CategoriesV2Page />) },
        { path: 'categories/:id', element: withPageLoader(<CategoryDetailV2Page />) },
        { path: 'targets', element: withPageLoader(<TargetsV2Page />) },
        { path: 'periods', element: withPageLoader(<PeriodsV2Page />) },
        { path: 'vendors', element: withPageLoader(<VendorsV2Page />) },
        { path: 'vendors/:id', element: withPageLoader(<VendorDetailV2Page />) },
        { path: 'subscriptions', element: withPageLoader(<SubscriptionsV2Page />) },
        { path: 'subscriptions/:id', element: withPageLoader(<SubscriptionDetailV2Page />) },
        { path: 'overlays', element: withPageLoader(<PlaceholderPage />) },
        { path: 'settings', element: withPageLoader(<SettingsV2Page />) },
        { path: '*', element: withPageLoader(<NotFoundPage />) },
      ],
    },
    {
      path: '/onboarding',
      element: (
        <ProtectedRoute skipOnboardingGuard>{withPageLoader(<OnboardingV2Page />)}</ProtectedRoute>
      ),
    },
    {
      path: '/auth',
      element: withPageLoader(<V2AuthLayoutComponent />),
      children: [
        { index: true, element: <Navigate to="/auth/login" replace /> },
        { path: 'login', element: withPageLoader(<V2LoginPageComponent />) },
        { path: 'register', element: withPageLoader(<V2RegisterPageComponent />) },
        { path: 'forgot-password', element: withPageLoader(<V2ForgotPasswordPageComponent />) },
        { path: 'reset-password', element: withPageLoader(<V2ResetPasswordPageComponent />) },
        { path: 'unlock', element: withPageLoader(<V2UnlockAccountPageComponent />) },
        {
          path: 'emergency-2fa-disable',
          element: withPageLoader(<V2Emergency2FADisablePageComponent />),
        },
      ],
    },
    // Error pages (accessible without authentication)
    { path: '/error/500', element: withPageLoader(<ServerErrorPage />) },
    { path: '/error/403', element: withPageLoader(<AccessDeniedPage />) },
    // Global 404 catch-all
    { path: '*', element: withPageLoader(<NotFoundPage />) },
  ]);
  return (
    <AuthProvider>
      <EncryptionProvider>
        <RouterProvider router={router} />
      </EncryptionProvider>
    </AuthProvider>
  );
}
