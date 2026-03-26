import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { AccountCard } from './AccountCard';

const ACCOUNT_ID = 'mock-account-1';
const PERIOD_ID = 'mock-period-1';
const DETAILS_EP = '*/api/v2/accounts/*/details*';
const HISTORY_EP = '*/api/v2/accounts/*/balance-history*';
const ACCOUNTS_EP = '*/api/v2/accounts*';

const baseAccount = {
  id: ACCOUNT_ID,
  name: 'Main Checking',
  color: '#8B7EC8',
  status: 'active' as const,
  currentBalance: 578040,
  netChangeThisPeriod: 34000,
  nextTransfer: null,
  balanceAfterNextTransfer: null,
  numberOfTransactions: 47,
  inflow: 420000,
  outflow: 386000,
  stabilityContext: {},
  categoriesBreakdown: [],
  transactionsBreakdown: [],
};

const checking = { ...baseAccount, type: 'Checking' as const, avgDailyBalance: 542000 };
const savings = {
  ...baseAccount,
  type: 'Savings' as const,
  name: 'Emergency Fund',
  currentBalance: 826000,
  netChangeThisPeriod: 92000,
  inflow: 120000,
  outflow: 28000,
};
const wallet = {
  ...baseAccount,
  type: 'Wallet' as const,
  name: 'Daily Cash',
  currentBalance: 24500,
  netChangeThisPeriod: -5500,
  numberOfTransactions: 12,
};
const allowance = {
  ...baseAccount,
  type: 'Allowance' as const,
  name: 'Kids Allowance',
  currentBalance: 3250,
  topUpAmount: 5000,
  topUpCycle: 'week',
  nextTransfer: '2026-03-28',
  balanceAfterNextTransfer: 8250,
  spentThisCycle: 1750,
};
const allowanceNegative = {
  ...allowance,
  name: 'Lunch Money',
  currentBalance: -1200,
  topUpAmount: 3000,
  topUpCycle: 'bi-weekly',
  nextTransfer: '2026-04-01',
  balanceAfterNextTransfer: 1800,
};
const creditCard = {
  ...baseAccount,
  type: 'CreditCard' as const,
  name: 'Visa Platinum',
  currentBalance: 184730,
  spendLimit: 500000,
  statementCloseDay: 22,
  paymentDueDay: 5,
};
const creditCardNoLimit = {
  ...creditCard,
  name: 'Amex Gold',
  currentBalance: 342000,
  spendLimit: null,
};
const emptyAccount = {
  ...baseAccount,
  name: 'New Savings',
  type: 'Savings' as const,
  currentBalance: 0,
  numberOfTransactions: 0,
  netChangeThisPeriod: 0,
};
const archivedAccount = {
  ...baseAccount,
  name: 'Old Checking',
  status: 'inactive' as const,
};

const mockHistory = Array.from({ length: 15 }, (_, i) => ({
  date: `2026-03-${String(i + 10).padStart(2, '0')}`,
  balance: 550000 + i * 2000 + Math.round(Math.random() * 5000),
  transactionCount: Math.floor(Math.random() * 5),
}));

const handlers = (account: Record<string, unknown>) => [
  http.get(DETAILS_EP, () => HttpResponse.json(account)),
  http.get(HISTORY_EP, () => HttpResponse.json(mockHistory)),
  http.get(ACCOUNTS_EP, () => HttpResponse.json({ data: [account] })),
];

const meta: Meta<typeof AccountCard> = {
  title: 'v2/Dashboard/AccountCard',
  component: AccountCard,
  tags: ['autodocs'],
  args: { accountId: ACCOUNT_ID, periodId: PERIOD_ID },
  decorators: [
    createStoryDecorator(),
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <div style={{ maxWidth: 540 }}>
          <Story />
        </div>
      </V2ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AccountCard>;

export const Checking: Story = {
  parameters: { msw: { handlers: handlers(checking) } },
};

export const Savings: Story = {
  parameters: { msw: { handlers: handlers(savings) } },
};

export const Wallet: Story = {
  parameters: { msw: { handlers: handlers(wallet) } },
};

export const Allowance: Story = {
  parameters: { msw: { handlers: handlers(allowance) } },
};

export const AllowanceNegative: Story = {
  parameters: { msw: { handlers: handlers(allowanceNegative) } },
};

export const CreditCardWithLimit: Story = {
  parameters: { msw: { handlers: handlers(creditCard) } },
};

export const CreditCardNoLimit: Story = {
  parameters: { msw: { handlers: handlers(creditCardNoLimit) } },
};

export const Empty: Story = {
  parameters: { msw: { handlers: handlers(emptyAccount) } },
};

export const Archived: Story = {
  parameters: { msw: { handlers: handlers(archivedAccount) } },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(DETAILS_EP, async () => {
          await new Promise(() => {});
        }),
        http.get(HISTORY_EP, async () => {
          await new Promise(() => {});
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(DETAILS_EP, () => new HttpResponse(null, { status: 500 })),
        http.get(HISTORY_EP, () => new HttpResponse(null, { status: 500 })),
      ],
    },
  },
};

export const Mobile: Story = {
  parameters: {
    msw: { handlers: handlers(checking) },
    viewport: { defaultViewport: 'mobile1' },
  },
};
