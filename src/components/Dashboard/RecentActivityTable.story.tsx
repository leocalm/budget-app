import type { Meta, StoryObj } from '@storybook/react';
import { initialTransactions } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { RecentActivityTable } from './RecentActivityTable';

const meta: Meta<typeof RecentActivityTable> = {
  title: 'Components/Dashboard/RecentActivityTable',
  component: RecentActivityTable,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof RecentActivityTable>;

export const Default: Story = {
  args: {
    transactions: initialTransactions,
    onViewAll: () => {},
  },
};

export const WithoutViewAll: Story = {
  args: {
    transactions: initialTransactions,
  },
};

export const Empty: Story = {
  args: {
    transactions: [],
    onViewAll: () => {},
  },
};

export const SingleTransaction: Story = {
  args: {
    transactions: [initialTransactions[0]],
    onViewAll: () => {},
  },
};
