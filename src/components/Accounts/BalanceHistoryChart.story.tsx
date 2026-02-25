import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { euroCurrency, mockBalanceHistory } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { BalanceHistoryChart } from './BalanceHistoryChart';

const meta: Meta<typeof BalanceHistoryChart> = {
  title: 'Components/Accounts/BalanceHistoryChart',
  component: BalanceHistoryChart,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof BalanceHistoryChart>;

export const Default: Story = {
  args: { accountId: 'acc-1', periodId: 'per-1', currency: euroCurrency },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts/:id/balance-history', () =>
          HttpResponse.json(mockBalanceHistory)
        ),
      ],
    },
  },
};

export const Loading: Story = {
  args: { accountId: 'acc-1', periodId: 'per-1', currency: euroCurrency },
  parameters: {
    msw: {
      handlers: [mswHandlers.loading('/api/v1/accounts/:id/balance-history')],
    },
  },
};

export const Empty: Story = {
  args: { accountId: 'acc-1', periodId: 'per-1', currency: euroCurrency },
  parameters: {
    msw: {
      handlers: [http.get('/api/v1/accounts/:id/balance-history', () => HttpResponse.json([]))],
    },
  },
};
