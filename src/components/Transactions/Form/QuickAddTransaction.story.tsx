;
// components/transactions/QuickAddTransaction/QuickAddTransaction.stories.tsx
// components/transactions/QuickAddTransaction/QuickAddTransaction.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QuickAddTransaction } from './QuickAddTransaction';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof QuickAddTransaction> = {
  title: 'Transactions/QuickAddTransaction',
  component: QuickAddTransaction,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          forceColorScheme="dark"
          theme={{
            colors: {
              dark: [
                '#C1C2C5',
                '#A6A7AB',
                '#8892a6',
                '#5a6272',
                '#373A40',
                '#1e2433',
                '#151b26',
                '#121720',
                '#1a1f2e',
                '#0a0e14',
              ],
            },
          }}
        >
          <Notifications />
          <div style={{ padding: '2rem', background: '#0a0e14', minHeight: '100vh' }}>
            <Story />
          </div>
        </MantineProvider>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0a0e14' }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof QuickAddTransaction>;

// Mock data for stories
const mockAccounts = [
  {
    id: '1',
    name: 'ING',
    icon: '💳',
    color: '#00ffa3',
    account_type: 'Checking' as const,
    balance: 500,
    currency: {
      id: '1',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimal_places: 2,
    },
  },
  {
    id: '2',
    name: 'AMEX',
    icon: '💳',
    color: '#00d4ff',
    account_type: 'CreditCard' as const,
    balance: -1362.55,
    currency: {
      id: '1',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimal_places: 2,
    },
  },
];

const mockCategories = [
  {
    id: '1',
    name: 'Comida',
    icon: '🍔',
    color: '#b47aff',
    parent_id: null,
    category_type: 'Outgoing' as const,
  },
  {
    id: '2',
    name: 'Mercado',
    icon: '🛒',
    color: '#ffa940',
    parent_id: null,
    category_type: 'Outgoing' as const,
  },
  {
    id: '3',
    name: 'Farmacia',
    icon: '💊',
    color: '#ff6b9d',
    parent_id: null,
    category_type: 'Outgoing' as const,
  },
];

const mockVendors = [
  { id: '1', name: "McDonald's" },
  { id: '2', name: 'Albert Heijn' },
  { id: '3', name: 'Etos' },
  { id: '4', name: 'Netflix' },
];

// Mock API handlers
const mockApiHandlers = {
  getAccounts: () => Promise.resolve(mockAccounts),
  getCategories: () => Promise.resolve(mockCategories),
  getVendors: () => Promise.resolve(mockVendors),
  createTransaction: (data: any) => {
    console.log('Creating transaction:', data);
    return Promise.resolve({
      id: 'new-1',
      ...data,
      category: mockCategories.find((c) => c.id === data.category_id),
      from_account: mockAccounts.find((a) => a.id === data.from_account_id),
      to_account: null,
      vendor: mockVendors.find((v) => v.id === data.vendor_id),
    });
  },
};

// Default story
export const Default: Story = {
  args: {
    onSuccess: () => console.log('Transaction created successfully'),
  },
  parameters: {
    msw: {
      handlers: [
        // Mock API responses here if needed
      ],
    },
  },
};

// With default date
export const WithDefaultDate: Story = {
  args: {
    defaultDate: new Date('2026-01-20'),
    onSuccess: () => console.log('Transaction created'),
  },
};

// Loading state (you'd need to modify component to support this)
export const Loading: Story = {
  args: {
    onSuccess: () => console.log('Transaction created'),
  },
  parameters: {
    msw: {
      handlers: [
        // Mock slow response
      ],
    },
  },
};

// Mobile view
export const Mobile: Story = {
  args: {
    onSuccess: () => console.log('Transaction created'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
