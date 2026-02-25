import type { Meta, StoryObj } from '@storybook/react';
import { mockBudgetStability } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { BudgetStabilityCard } from './BudgetStabilityCard';

const meta: Meta<typeof BudgetStabilityCard> = {
  title: 'Components/Dashboard/BudgetStabilityCard',
  component: BudgetStabilityCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof BudgetStabilityCard>;

export const Default: Story = {
  args: {
    data: mockBudgetStability,
    isLoading: false,
    isError: false,
    onRetry: () => {},
  },
};

export const HighStability: Story = {
  args: {
    data: {
      ...mockBudgetStability,
      withinTolerancePercentage: 100,
      periodsWithinTolerance: 12,
      totalClosedPeriods: 12,
    },
    isLoading: false,
    isError: false,
    onRetry: () => {},
  },
};

export const LowStability: Story = {
  args: {
    data: {
      ...mockBudgetStability,
      withinTolerancePercentage: 25,
      periodsWithinTolerance: 3,
      totalClosedPeriods: 12,
    },
    isLoading: false,
    isError: false,
    onRetry: () => {},
  },
};

export const NoPeriods: Story = {
  args: {
    data: {
      ...mockBudgetStability,
      totalClosedPeriods: 0,
      periodsWithinTolerance: 0,
      recentClosedPeriods: [],
    },
    isLoading: false,
    isError: false,
    onRetry: () => {},
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    isError: false,
    onRetry: () => {},
  },
};

export const Error: Story = {
  args: {
    isLoading: false,
    isError: true,
    onRetry: () => {},
  },
};
