import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { euroCurrency, mockAccountContext } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { AccountContextSection } from './AccountContextSection';

const meta: Meta<typeof AccountContextSection> = {
  title: 'Components/Accounts/AccountContextSection',
  component: AccountContextSection,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof AccountContextSection>;

export const Default: Story = {
  args: { accountId: 'acc-1', periodId: 'per-1', currency: euroCurrency },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts/:id/context', () => HttpResponse.json(mockAccountContext)),
      ],
    },
  },
};

export const Loading: Story = {
  args: { accountId: 'acc-1', periodId: 'per-1', currency: euroCurrency },
  parameters: {
    msw: {
      handlers: [mswHandlers.loading('/api/v1/accounts/:id/context')],
    },
  },
};

export const Empty: Story = {
  args: { accountId: 'acc-1', periodId: 'per-1', currency: euroCurrency },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/accounts/:id/context', () =>
          HttpResponse.json({ categoryImpact: [], stability: mockAccountContext.stability })
        ),
      ],
    },
  },
};
