import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import type { components } from '@/api/v2';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { NetPositionCard } from './NetPositionCard';

type NetPosition = components['schemas']['NetPosition'];
type AccountSummaryResponse = components['schemas']['AccountSummaryResponse'];

const PERIOD_ID = 'mock-period-1';
const ENDPOINT = '*/api/v2/dashboard/net-position*';
const ACCOUNTS_ENDPOINT = '*/api/v2/accounts/summary*';

const mockPositive: NetPosition = {
  total: 1284000,
  differenceThisPeriod: 34000,
  numberOfAccounts: 3,
  liquidAmount: 578000,
  protectedAmount: 826000,
  debtAmount: 120000,
};

const mockNegativeChange: NetPosition = {
  total: 842000,
  differenceThisPeriod: -158000,
  numberOfAccounts: 4,
  liquidAmount: 252000,
  protectedAmount: 890000,
  debtAmount: 300000,
};

const mockNoDebt: NetPosition = {
  total: 1404000,
  differenceThisPeriod: 92000,
  numberOfAccounts: 2,
  liquidAmount: 578000,
  protectedAmount: 826000,
  debtAmount: 0,
};

const mockEmpty: NetPosition = {
  total: 0,
  differenceThisPeriod: 0,
  numberOfAccounts: 0,
  liquidAmount: 0,
  protectedAmount: 0,
  debtAmount: 0,
};

const mockAccounts: AccountSummaryResponse[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    color: '#4dabf7',
    type: 'Checking',
    status: 'active',
    currentBalance: -75467,
    netChangeThisPeriod: -12000,
    nextTransfer: null,
    balanceAfterNextTransfer: null,
    numberOfTransactions: 14,
  },
  {
    id: 'acc-2',
    name: 'Savings Account',
    color: '#69db7c',
    type: 'Savings',
    status: 'active',
    currentBalance: 796000,
    netChangeThisPeriod: 50000,
    nextTransfer: null,
    balanceAfterNextTransfer: null,
    numberOfTransactions: 2,
  },
  {
    id: 'acc-3',
    name: 'Dinning out',
    color: '#ffa94d',
    type: 'Allowance',
    status: 'active',
    currentBalance: 21500,
    netChangeThisPeriod: -8000,
    nextTransfer: null,
    balanceAfterNextTransfer: null,
    numberOfTransactions: 5,
  },
  {
    id: 'acc-4',
    name: 'Visa',
    color: '#f06595',
    type: 'CreditCard',
    status: 'active',
    currentBalance: 66700,
    netChangeThisPeriod: 10000,
    nextTransfer: null,
    balanceAfterNextTransfer: null,
    numberOfTransactions: 8,
  },
];

const HISTORY_ENDPOINT = '*/api/v2/dashboard/net-position-history*';

const mockHistory = [
  {
    date: '2026-03-01',
    total: 1250000,
    liquidAmount: 560000,
    protectedAmount: 810000,
    debtAmount: 120000,
  },
  {
    date: '2026-03-05',
    total: 1258000,
    liquidAmount: 565000,
    protectedAmount: 813000,
    debtAmount: 120000,
  },
  {
    date: '2026-03-10',
    total: 1262000,
    liquidAmount: 568000,
    protectedAmount: 814000,
    debtAmount: 120000,
  },
  {
    date: '2026-03-15',
    total: 1270000,
    liquidAmount: 572000,
    protectedAmount: 818000,
    debtAmount: 120000,
  },
  {
    date: '2026-03-20',
    total: 1280000,
    liquidAmount: 576000,
    protectedAmount: 824000,
    debtAmount: 120000,
  },
  {
    date: '2026-03-25',
    total: 1284000,
    liquidAmount: 578000,
    protectedAmount: 826000,
    debtAmount: 120000,
  },
];

const successHandler = (data: NetPosition) => [
  http.get(ENDPOINT, () => HttpResponse.json(data)),
  http.get(HISTORY_ENDPOINT, () => HttpResponse.json(mockHistory)),
  http.get(ACCOUNTS_ENDPOINT, () => HttpResponse.json({ data: mockAccounts, nextCursor: null })),
];

const meta: Meta<typeof NetPositionCard> = {
  title: 'v2/Dashboard/NetPositionCard',
  component: NetPositionCard,
  tags: ['autodocs'],
  args: { periodId: PERIOD_ID },
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <div style={{ maxWidth: 600, padding: 16 }}>
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator(),
  ],
};

export default meta;
type Story = StoryObj<typeof NetPositionCard>;

export const PositiveNetPosition: Story = {
  parameters: { msw: { handlers: successHandler(mockPositive) } },
};

export const NegativeChange: Story = {
  parameters: { msw: { handlers: successHandler(mockNegativeChange) } },
};

export const NoDebt: Story = {
  parameters: { msw: { handlers: successHandler(mockNoDebt) } },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(ENDPOINT, async () => {
          await new Promise(() => {});
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [http.get(ENDPOINT, () => new HttpResponse(null, { status: 500 }))],
    },
  },
};

export const Empty: Story = {
  parameters: { msw: { handlers: successHandler(mockEmpty) } },
};

export const Mobile: Story = {
  parameters: {
    msw: { handlers: successHandler(mockPositive) },
    viewport: { defaultViewport: 'mobile1' },
  },
};
