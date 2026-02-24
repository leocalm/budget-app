import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { BasicAppShell } from './AppShell';
import { Accounts } from './components/Accounts/Accounts';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { ResetPasswordPage } from './components/Auth/ResetPasswordPage';
import { Categories } from './components/Categories/Categories';
import { DashboardPage } from './components/Dashboard/DashboardPage';
import { OverlaysPage } from './components/Overlays/OverlaysPage';
import { PeriodsPage } from './components/Periods/PeriodsPage';
import { SettingsPage } from './components/Settings/SettingsPage';
import { Transactions } from './components/Transactions/Transactions';
import { Vendors } from './components/Vendors/Vendors';
import { AuthContext } from './context/AuthContext';
import { BudgetProvider } from './context/BudgetContext';
import { handlers } from './mocks/handlers';

// Mock Auth Context setup
const mockUser = {
  id: '1',
  email: 'designer@example.com',
  name: 'Design Team',
  role: 'user',
};

const MockAuthProvider = ({
  children,
  authenticated = true,
}: {
  children: React.ReactNode;
  authenticated?: boolean;
}) => (
  <AuthContext.Provider
    value={{
      user: authenticated ? (mockUser as any) : null,
      isAuthenticated: authenticated,
      isLoading: false,
      login: () => {},
      logout: () => {},
      refreshUser: async () => true,
    }}
  >
    {children}
  </AuthContext.Provider>
);

export default {
  title: 'App Pages',
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    },
  });

const AuthenticatedPage = (Story: any) => {
  const [queryClient] = React.useState(() => createTestQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider authenticated>
        <BudgetProvider>
          <BasicAppShell>
            <Story />
          </BasicAppShell>
        </BudgetProvider>
      </MockAuthProvider>
    </QueryClientProvider>
  );
};

const PublicPage = (Story: any) => {
  const [queryClient] = React.useState(() => createTestQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider authenticated={false}>
        <Story />
      </MockAuthProvider>
    </QueryClientProvider>
  );
};

const AuthPageDecorator = (Story: any) => {
  const [queryClient] = React.useState(() => createTestQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider authenticated={false}>
        <div
          style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
        >
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <Story />
          </div>
        </div>
      </MockAuthProvider>
    </QueryClientProvider>
  );
};

export const Dashboard = () => <DashboardPage />;
Dashboard.decorators = [AuthenticatedPage];

export const DashboardEmpty = () => <DashboardPage />;
DashboardEmpty.decorators = [AuthenticatedPage];
DashboardEmpty.parameters = {
  msw: {
    handlers: handlers.map((h) => h), // Inherit default handlers
  },
  // We can also use query params in the mock handlers we wrote
  // or define override handlers here
};
// Setting the scenario via path in MSW handlers is more flexible,
// but for simplicity in this file, I'll add examples of how to use MSW parameters.

export const TransactionsPage = () => <Transactions />;
TransactionsPage.decorators = [AuthenticatedPage];

export const TransactionsError = () => <Transactions />;
TransactionsError.decorators = [AuthenticatedPage];
TransactionsError.parameters = {
  msw: {
    handlers: [
      http.get('/api/v1/transactions', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    ],
  },
};

export const AccountsPage = () => <Accounts />;
AccountsPage.decorators = [AuthenticatedPage];

export const AccountsEmpty = () => <Accounts />;
AccountsEmpty.decorators = [AuthenticatedPage];
AccountsEmpty.parameters = {
  msw: {
    handlers: [
      http.get('/api/v1/accounts', () => {
        return HttpResponse.json([]);
      }),
    ],
  },
};

export const CategoriesPage = () => <Categories />;
CategoriesPage.decorators = [AuthenticatedPage];

export const VendorsPage = () => <Vendors />;
VendorsPage.decorators = [AuthenticatedPage];

export const Periods = () => <PeriodsPage />;
Periods.decorators = [AuthenticatedPage];

export const Overlays = () => <OverlaysPage />;
Overlays.decorators = [AuthenticatedPage];

export const Settings = () => <SettingsPage />;
Settings.decorators = [AuthenticatedPage];

export const Login = () => <LoginPage />;
Login.decorators = [AuthPageDecorator];

export const Register = () => <RegisterPage />;
Register.decorators = [AuthPageDecorator];

export const ForgotPassword = () => <ForgotPasswordPage />;
ForgotPassword.decorators = [AuthPageDecorator];

export const ResetPassword = () => <ResetPasswordPage />;
ResetPassword.decorators = [AuthPageDecorator];

export const MSWDebug = () => {
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/v1/settings')
      .then((res) => res.json())
      .then(setData)
      .catch(setError);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>MSW Debug</h1>
      <p>
        This story tests if MSW is intercepting requests to <code>/api/v1/settings</code>
      </p>
      {data ? (
        <pre data-testid="msw-success">{JSON.stringify(data, null, 2)}</pre>
      ) : error ? (
        <pre style={{ color: 'red' }} data-testid="msw-error">
          {error.message}
        </pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
MSWDebug.decorators = [PublicPage];
