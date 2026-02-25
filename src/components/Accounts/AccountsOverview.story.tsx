import type { Meta, StoryObj } from '@storybook/react';
import { delay, http, HttpResponse } from 'msw';
import { Box, Stack } from '@mantine/core';
import { mockAccounts } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { AccountsOverview } from './AccountsOverview';

/* ==================== ACCOUNTS OVERVIEW FULL PAGE ==================== */

const meta: Meta<typeof AccountsOverview> = {
  title: 'Components/Accounts/AccountsOverview',
  component: AccountsOverview,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
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
    <Box maw={500}>
      <Stack>
        <p style={{ fontSize: '12px', color: '#666' }}>Standard Account Row - Checking</p>
        <AccountsOverview />
      </Stack>
    </Box>
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
    <Box maw={500}>
      <Stack>
        <p style={{ fontSize: '12px', color: '#666' }}>Standard Account Row - Savings</p>
        <AccountsOverview />
      </Stack>
    </Box>
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
    <Box maw={500}>
      <Stack>
        <p style={{ fontSize: '12px', color: '#666' }}>Standard Account Row - Credit Card</p>
        <AccountsOverview />
      </Stack>
    </Box>
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
    <Box maw={500}>
      <Stack>
        <p style={{ fontSize: '12px', color: '#666' }}>Standard Account Row - Wallet</p>
        <AccountsOverview />
      </Stack>
    </Box>
  ),
};

/* ==================== ALLOWANCE ACCOUNT VARIATIONS ==================== */

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
    <Box maw={500}>
      <Stack>
        <p style={{ fontSize: '12px', color: '#666' }}>Allowance Account Row - With Transfer</p>
        <AccountsOverview />
      </Stack>
    </Box>
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
    <Box maw={500}>
      <Stack>
        <p style={{ fontSize: '12px', color: '#666' }}>Allowance Account Row - No Transfer Set</p>
        <AccountsOverview />
      </Stack>
    </Box>
  ),
};

/* ==================== ACCOUNT GROUP SECTION VARIATIONS ==================== */

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
    <Stack>
      <p style={{ fontSize: '12px', color: '#666' }}>Liquid Accounts Section</p>
      <AccountsOverview />
    </Stack>
  ),
};

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
    <Stack>
      <p style={{ fontSize: '12px', color: '#666' }}>Savings Accounts Section</p>
      <AccountsOverview />
    </Stack>
  ),
};

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
    <Stack>
      <p style={{ fontSize: '12px', color: '#666' }}>Debt Accounts Section</p>
      <AccountsOverview />
    </Stack>
  ),
};

/* ==================== ALLOWANCE GROUP SECTION VARIATIONS ==================== */

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
    <Stack>
      <p style={{ fontSize: '12px', color: '#666' }}>Allowance Group Section - With Accounts</p>
      <AccountsOverview />
    </Stack>
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
    <Stack>
      <p style={{ fontSize: '12px', color: '#666' }}>Allowance Group Section - Empty</p>
      <AccountsOverview />
    </Stack>
  ),
};
