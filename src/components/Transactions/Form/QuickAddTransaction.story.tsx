// components/transactions/QuickAddTransaction/QuickAddTransaction.stories.tsx
// components/transactions/QuickAddTransaction/QuickAddTransaction.stories.tsx
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
