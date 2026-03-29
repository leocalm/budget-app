import { lazy, ReactElement, Suspense, useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';
import { BasicAppShell } from './AppShell';
import { ProtectedRoute } from './components/Auth';
import { PageLoader } from './components/Utils';
import { AuthProvider } from './context/AuthContext';
import { BudgetProvider } from './context/BudgetContext';
import { V2ThemeProvider } from './theme/v2';

const DashboardPage = lazy(() =>
  import('./components/Dashboard/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);
const Transactions = lazy(() =>
  import('./components/Transactions/Transactions').then((module) => ({
    default: module.Transactions,
  }))
);
const Accounts = lazy(() =>
  import('./components/Accounts/Accounts').then((module) => ({
    default: module.Accounts,
  }))
);
const AccountDetailPage = lazy(() =>
  import('./components/Accounts/AccountDetailPage').then((module) => ({
    default: module.AccountDetailPage,
  }))
);
const Categories = lazy(() =>
  import('./components/Categories/Categories').then((module) => ({
    default: module.Categories,
  }))
);
const CategoryDetailPage = lazy(() =>
  import('./components/Categories/CategoryDetailPage').then((module) => ({
    default: module.CategoryDetailPage,
  }))
);
const Vendors = lazy(() =>
  import('./components/Vendors/Vendors').then((module) => ({
    default: module.Vendors,
  }))
);
const Budget = lazy(() =>
  import('./components/Budget/Budget').then((module) => ({
    default: module.Budget,
  }))
);
const PeriodsPage = lazy(() =>
  import('./components/Periods/PeriodsPage').then((module) => ({
    default: module.PeriodsPage,
  }))
);
const OverlaysPage = lazy(() =>
  import('./components/Overlays/OverlaysPage').then((module) => ({
    default: module.OverlaysPage,
  }))
);
const SettingsPage = lazy(() =>
  import('./components/Settings/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  }))
);
const AuthLayout = lazy(() =>
  import('./components/Auth/AuthLayout').then((module) => ({
    default: module.AuthLayout,
  }))
);
const LoginPage = lazy(() =>
  import('./components/Auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import('./components/Auth/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  }))
);
const ForgotPasswordPage = lazy(() =>
  import('./components/Auth/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import('./components/Auth/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  }))
);
const Emergency2FADisablePage = lazy(() =>
  import('./components/Auth/Emergency2FADisablePage').then((module) => ({
    default: module.Emergency2FADisablePage,
  }))
);
const UnlockAccountPage = lazy(() =>
  import('./components/Auth/UnlockAccountPage').then((module) => ({
    default: module.UnlockAccountPage,
  }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFound.page').then((module) => ({
    default: module.NotFoundPage,
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
const OnboardingPage = lazy(() =>
  import('./pages/Onboarding.page').then((module) => ({
    default: module.OnboardingPage,
  }))
);
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

// V2 Auth pages — lazy loaded individually
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

const Layout = () => {
  const location = useLocation();

  /** Move focus to page H1 on route change for screen reader accessibility */
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
      <BudgetProvider>
        <BasicAppShell>
          <Outlet />
        </BasicAppShell>
      </BudgetProvider>
    </ProtectedRoute>
  );
};

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
      <BudgetProvider>
        <V2ThemeProvider colorMode={colorScheme === 'dark' ? 'dark' : 'light'}>
          <V2AppShell />
        </V2ThemeProvider>
      </BudgetProvider>
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
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: withPageLoader(<DashboardPage />) },
        { path: 'transactions', element: withPageLoader(<Transactions />) },
        { path: 'accounts', element: withPageLoader(<Accounts />) },
        { path: 'accounts/:id', element: withPageLoader(<AccountDetailPage />) },
        { path: 'categories', element: withPageLoader(<Categories />) },
        { path: 'categories/:id', element: withPageLoader(<CategoryDetailPage />) },
        { path: 'vendors', element: withPageLoader(<Vendors />) },
        { path: 'budget', element: withPageLoader(<Budget />) },
        { path: 'periods', element: withPageLoader(<PeriodsPage />) },
        { path: 'overlays', element: withPageLoader(<OverlaysPage />) },
        { path: 'settings', element: withPageLoader(<SettingsPage />) },
        // Catch-all for 404 within authenticated routes
        { path: '*', element: withPageLoader(<NotFoundPage />) },
      ],
    },
    {
      path: '/v2',
      element: withPageLoader(<V2Layout />),
      children: [
        { index: true, element: <Navigate to="/v2/dashboard" replace /> },
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
        <ProtectedRoute skipOnboardingGuard>{withPageLoader(<OnboardingPage />)}</ProtectedRoute>
      ),
    },
    {
      path: '/v2/onboarding',
      element: (
        <ProtectedRoute skipOnboardingGuard>{withPageLoader(<OnboardingV2Page />)}</ProtectedRoute>
      ),
    },
    {
      path: '/v2/auth',
      element: withPageLoader(<V2AuthLayoutComponent />),
      children: [
        { index: true, element: <Navigate to="/v2/auth/login" replace /> },
        { path: 'login', element: withPageLoader(<V2LoginPageComponent />) },
        { path: 'register', element: withPageLoader(<V2RegisterPageComponent />) },
        { path: 'forgot-password', element: withPageLoader(<V2ForgotPasswordPageComponent />) },
        { path: 'reset-password', element: withPageLoader(<V2ResetPasswordPageComponent />) },
        { path: 'unlock', element: withPageLoader(<V2UnlockAccountPageComponent />) },
      ],
    },
    {
      path: '/auth',
      element: withPageLoader(<AuthLayout />),
      children: [
        { path: 'login', element: withPageLoader(<LoginPage />) },
        { path: 'register', element: withPageLoader(<RegisterPage />) },
        { path: 'forgot-password', element: withPageLoader(<ForgotPasswordPage />) },
        { path: 'reset-password', element: withPageLoader(<ResetPasswordPage />) },
        { path: 'emergency-2fa-disable', element: withPageLoader(<Emergency2FADisablePage />) },
        { path: 'unlock', element: withPageLoader(<UnlockAccountPage />) },
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
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
