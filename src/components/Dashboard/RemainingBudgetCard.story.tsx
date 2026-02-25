import type { Meta, StoryObj } from '@storybook/react';
import { mockMonthlyBurnIn } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { RemainingBudgetCard } from './RemainingBudgetCard';

const meta: Meta<typeof RemainingBudgetCard> = {
  title: 'Components/Dashboard/RemainingBudgetCard',
  component: RemainingBudgetCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof RemainingBudgetCard>;

export const Default: Story = {
  args: {
    data: mockMonthlyBurnIn,
    totalAsset: 603500,
  },
};

export const OverBudget: Story = {
  args: {
    data: { ...mockMonthlyBurnIn, spentBudget: 220000, totalBudget: 200000 },
    totalAsset: 603500,
  },
};

export const NearLimit: Story = {
  args: {
    data: { ...mockMonthlyBurnIn, spentBudget: 195000, totalBudget: 200000 },
    totalAsset: 603500,
  },
};

export const NoData: Story = {
  args: {
    data: undefined,
    totalAsset: undefined,
  },
};
