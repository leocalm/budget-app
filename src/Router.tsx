import { lazy, ReactElement, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { BasicAppShell } from './AppShell';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { PageLoader } from './components/Utils/PageLoader';
import { AuthProvider } from './context/AuthContext';
import { BudgetProvider } from './context/BudgetContext';

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
const ReportsPage = lazy(() =>
  import('./components/Reports/ReportsPage').then((module) => ({
    default: module.ReportsPage,
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

const Layout = () => (
  <ProtectedRoute>
    <BudgetProvider>
      <BasicAppShell>
        <Outlet />
      </BasicAppShell>
    </BudgetProvider>
  </ProtectedRoute>
);

const withPageLoader = (element: ReactElement) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export function Router() {
  const { t } = useTranslation();
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
        // Placeholders for other routes
        { path: 'reports', element: withPageLoader(<ReportsPage />) },
        { path: 'goals', element: <div>{t('router.goals')}</div> },
        { path: 'recurring', element: <div>{t('router.recurring')}</div> },
        { path: 'settings', element: withPageLoader(<SettingsPage />) },
        { path: 'help', element: <div>{t('router.help')}</div> },
        { path: 'more', element: <div>{t('router.more')}</div> },
      ],
    },
    {
      path: '/auth',
      element: withPageLoader(<AuthLayout />),
      children: [
        { path: 'login', element: withPageLoader(<LoginPage />) },
        { path: 'register', element: withPageLoader(<RegisterPage />) },
        { path: 'forgot-password', element: withPageLoader(<ForgotPasswordPage />) },
      ],
    },
  ]);
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
