import type { Meta, StoryObj } from '@storybook/react';
import { mockAccounts, mockCategoryWithStats, mockVendorsWithStats } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { QuickAddTransaction } from './QuickAddTransaction';

const meta: Meta<typeof QuickAddTransaction> = {
  title: 'Components/Transactions/QuickAddTransaction',
  component: QuickAddTransaction,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof QuickAddTransaction>;

const formHandlers = [
  mswHandlers.success('/api/v1/accounts', mockAccounts),
  mswHandlers.success('/api/v1/categories', mockCategoryWithStats),
  mswHandlers.success('/api/v1/vendors', mockVendorsWithStats),
];

export const Default: Story = {
  args: { onSuccess: () => {} },
  parameters: { msw: { handlers: formHandlers } },
};

export const Loading: Story = {
  args: { onSuccess: () => {} },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.loading('/api/v1/accounts'),
        mswHandlers.loading('/api/v1/categories'),
      ],
    },
  },
};
