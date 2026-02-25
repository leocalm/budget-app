import type { Meta, StoryObj } from '@storybook/react';
import { mockMonthlyBurnIn } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { MonthlyBurnRate } from './MonthlyBurnRate';

const meta: Meta<typeof MonthlyBurnRate> = {
  title: 'Components/Dashboard/MonthlyBurnRate',
  component: MonthlyBurnRate,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof MonthlyBurnRate>;

export const Default: Story = {
  args: { data: mockMonthlyBurnIn },
};

export const HighBurnRate: Story = {
  args: {
    data: {
      ...mockMonthlyBurnIn,
      spentBudget: 180000,
      totalBudget: 200000,
      currentDay: 15,
      daysInPeriod: 30,
    },
  },
};

export const LowBurnRate: Story = {
  args: {
    data: {
      ...mockMonthlyBurnIn,
      spentBudget: 20000,
      totalBudget: 200000,
      currentDay: 15,
      daysInPeriod: 30,
    },
  },
};

export const NoData: Story = {
  args: { data: undefined },
};
