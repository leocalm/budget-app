import type { Meta, StoryObj } from '@storybook/react';
import { mockMonthlyBurnIn, mockMonthProgress } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CurrentPeriodCard } from './CurrentPeriodCard';

const meta: Meta<typeof CurrentPeriodCard> = {
  title: 'Components/Dashboard/CurrentPeriodCard',
  component: CurrentPeriodCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CurrentPeriodCard>;

export const Default: Story = {
  args: {
    selectedPeriodId: 'per-1',
    monthlyBurnIn: mockMonthlyBurnIn,
    monthProgress: mockMonthProgress,
    isLoading: false,
    isError: false,
    onRetry: () => {},
  },
};

export const Loading: Story = {
  args: {
    selectedPeriodId: 'per-1',
    isLoading: true,
    isError: false,
    onRetry: () => {},
  },
};

export const Error: Story = {
  args: {
    selectedPeriodId: 'per-1',
    isLoading: false,
    isError: true,
    onRetry: () => {},
  },
};

export const OverBudget: Story = {
  args: {
    selectedPeriodId: 'per-1',
    monthlyBurnIn: { ...mockMonthlyBurnIn, spentBudget: 220000, totalBudget: 200000 },
    monthProgress: mockMonthProgress,
    isLoading: false,
    isError: false,
    onRetry: () => {},
  },
};
