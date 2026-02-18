// components/transactions/QuickAddTransaction/QuickAddTransaction.stories.tsx
// components/transactions/QuickAddTransaction/QuickAddTransaction.stories.tsx
// components/transactions/QuickAddTransaction/QuickAddTransaction.stories.tsx
// components/transactions/QuickAddTransaction/QuickAddTransaction.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { ToastViewport } from '@/components/Notifications/ToastViewport';
import { BudgetProvider } from '@/context/BudgetContext';
import { queryKeys } from '@/hooks/queryKeys';
import { BudgetPeriod } from '@/types/budget';
import { QuickAddTransaction } from './QuickAddTransaction';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    },
  },
});

const mockCurrentPeriod: BudgetPeriod = {
  id: 'period-storybook-current',
  name: 'February 2026',
  startDate: '2026-02-01',
  endDate: '2026-02-28',
};

queryClient.setQueryData(queryKeys.budgetPeriods.current(), mockCurrentPeriod);
queryClient.setQueryData(queryKeys.budgetPeriods.list(), [mockCurrentPeriod]);

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
          <ToastViewport />
          <BudgetProvider>
            <div style={{ padding: '2rem', background: '#0a0e14', minHeight: '100vh' }}>
              <Story />
            </div>
          </BudgetProvider>
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

// Default story
export const Default: Story = {
  args: {
    onSuccess: () => {},
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
    onSuccess: () => {},
  },
};

// Loading state (you'd need to modify component to support this)
export const Loading: Story = {
  args: {
    onSuccess: () => {},
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
    onSuccess: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
