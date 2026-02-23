import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse, delay } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { mockAccounts } from '@/mocks/budgetData';
import { BudgetProvider } from '@/context/BudgetContext';
import { AccountsOverview } from './AccountsOverview';
import { Stack, Box } from '@mantine/core';

/* ==================== CONTEXT WRAPPER ==================== */

/**
 * Wrapper that provides BudgetProvider and QueryClient for components
 */
const ContextWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BudgetProvider>
        {children}
      </BudgetProvider>
    </QueryClientProvider>
  );
};

/* ==================== ACCOUNTS OVERVIEW FULL PAGE ==================== */

const meta: Meta<typeof AccountsOverview> = {
  title: 'Components/Accounts/AccountsOverview',
  component: AccountsOverview,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ContextWrapper>
        <Box p="xl">
          <Story />
        </Box>
      </ContextWrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AccountsOverview>;

/**
 * Default state showing all accounts with full balance information
 */
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          // Simulate a small delay to show realistic loading
          await delay(500);
          return HttpResponse.json(mockAccounts);
        }),
      ],
    },
  },
};

/**
 * Loading state with infinite loader
 */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          // Infinite delay to show loading state
          await delay('infinite');
          return HttpResponse.json(mockAccounts);
        }),
      ],
    },
  },
};

/**
 * Error state with retry alert
 */
export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
};

/**
 * Empty state with no accounts
 */
export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

/**
 * State with only liquid accounts (no savings or credit cards)
 */
export const OnlyLiquidAccounts: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[0], mockAccounts[4]]);
        }),
      ],
    },
  },
};

/**
 * State with only savings accounts
 */
export const OnlySavingsAccounts: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[1]]);
        }),
      ],
    },
  },
};

/**
 * State with only debt accounts
 */
export const OnlyDebtAccounts: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[2]]);
        }),
      ],
    },
  },
};

/**
 * State with mixed positive and negative balances
 */
export const MixedBalances: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json(mockAccounts);
        }),
      ],
    },
  },
};

/* ==================== INDIVIDUAL COMPONENTS ==================== */

/**
 * Stories for StandardAccountRow component
 */
export const StandardAccountRowStories = {
  title: 'Components/Accounts/AccountsOverview/StandardAccountRow',
  component: 'div', // Placeholder, actual component stories below
};

export const StandardAccountRowChecking: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[0]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl" maw={500}>
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Standard Account Row - Checking</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

export const StandardAccountRowSavings: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[1]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl" maw={500}>
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Standard Account Row - Savings</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

export const StandardAccountRowCreditCard: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[2]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl" maw={500}>
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Standard Account Row - Credit Card</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

export const StandardAccountRowWallet: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[4]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl" maw={500}>
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Standard Account Row - Wallet</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

/* ==================== ALLOWANCE ACCOUNT VARIATIONS ==================== */

/**
 * Stories for AllowanceAccountRow component
 */
export const AllowanceAccountRowWithTransfer: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[3]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl" maw={500}>
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Allowance Account Row - With Transfer</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

export const AllowanceAccountRowNoTransfer: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([
            {
              ...mockAccounts[3],
              nextTransferAmount: null,
            },
          ]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl" maw={500}>
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Allowance Account Row - No Transfer Set
          </p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

/* ==================== ACCOUNT GROUP SECTION VARIATIONS ==================== */

/**
 * Stories for AccountGroupSection component (Liquid)
 */
export const LiquidAccountsSection: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[0], mockAccounts[4]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl">
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Liquid Accounts Section</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

/**
 * Stories for AccountGroupSection component (Savings)
 */
export const SavingsAccountsSection: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[1]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl">
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Savings Accounts Section</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

/**
 * Stories for AccountGroupSection component (Debt)
 */
export const DebtAccountsSection: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[2]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl">
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Debt Accounts Section</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

/* ==================== ALLOWANCE GROUP SECTION VARIATIONS ==================== */

/**
 * Stories for AllowanceGroupSection component
 */
export const AllowanceGroupSectionWithAccounts: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[3]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl">
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Allowance Group Section - With Accounts</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};

export const AllowanceGroupSectionEmpty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts', async () => {
          return HttpResponse.json([mockAccounts[0], mockAccounts[1]]);
        }),
      ],
    },
  },
  render: () => (
    <ContextWrapper>
      <Box p="xl">
        <Stack>
          <p style={{ fontSize: '12px', color: '#666' }}>Allowance Group Section - Empty</p>
          <AccountsOverview />
        </Stack>
      </Box>
    </ContextWrapper>
  ),
};
