import type { Meta, StoryObj } from '@storybook/react';
import { mockMonthProgress } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { MonthProgressCard } from './MonthProgressCard';

const meta: Meta<typeof MonthProgressCard> = {
  title: 'Components/Dashboard/MonthProgressCard',
  component: MonthProgressCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof MonthProgressCard>;

export const Default: Story = {
  args: { data: mockMonthProgress },
};

export const EarlyMonth: Story = {
  args: {
    data: {
      ...mockMonthProgress,
      currentDate: '2026-01-03',
      remainingDays: 28,
      daysPassedPercentage: 10,
    },
  },
};

export const EndOfMonth: Story = {
  args: {
    data: {
      ...mockMonthProgress,
      currentDate: '2026-01-30',
      remainingDays: 1,
      daysPassedPercentage: 97,
    },
  },
};

export const NoData: Story = {
  args: { data: undefined },
};
