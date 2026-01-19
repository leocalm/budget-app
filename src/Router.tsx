import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { BasicAppShell } from './AppShell';
import { Accounts } from './components/Accounts/Accounts';
import { AccountDetailPage } from './components/Accounts/AccountDetailPage';
import { AuthLayout } from './components/Auth/AuthLayout';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { Budget } from './components/Budget/Budget';
import { Categories } from './components/Categories/Categories';
import { CategoryDetailPage } from './components/Categories/CategoryDetailPage';
import { DashboardPage } from './components/Dashboard/DashboardPage';
import { ReportsPage } from './components/Reports/ReportsPage';
import { SettingsPage } from './components/Settings/SettingsPage';
import { Transactions } from './components/Transactions/Transactions';
import { BudgetProvider } from './context/BudgetContext';

const Layout = () => (
  <BudgetProvider>
    <BasicAppShell>
      <Outlet />
    </BasicAppShell>
  </BudgetProvider>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'accounts', element: <Accounts /> },
      { path: 'accounts/:id', element: <AccountDetailPage /> },
      { path: 'categories', element: <Categories /> },
      { path: 'categories/:id', element: <CategoryDetailPage /> },
      { path: 'budget', element: <Budget /> },
      // Placeholders for other routes
      { path: 'reports', element: <ReportsPage /> },
      { path: 'goals', element: <div>Goals Page</div> },
      { path: 'recurring', element: <div>Recurring Page</div> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'help', element: <div>Help Page</div> },
      { path: 'more', element: <div>More Page</div> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}