import type { Meta, StoryObj } from '@storybook/react';
import { mockSpentPerCategory } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CategoriesChartCard } from './CategoriesChartCard';

const meta: Meta<typeof CategoriesChartCard> = {
  title: 'Components/Dashboard/CategoriesChartCard',
  component: CategoriesChartCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CategoriesChartCard>;

export const Default: Story = {
  args: { data: mockSpentPerCategory },
};

export const WithOverBudget: Story = {
  args: {
    data: [
      ...mockSpentPerCategory,
      {
        categoryName: 'Dining Out',
        budgetedValue: 10000,
        amountSpent: 15000,
        percentageSpent: 150,
      },
    ],
  },
};

export const Empty: Story = {
  args: { data: [] },
};

export const SingleCategory: Story = {
  args: {
    data: [{ categoryName: 'Food', budgetedValue: 50000, amountSpent: 42000, percentageSpent: 84 }],
  },
};
