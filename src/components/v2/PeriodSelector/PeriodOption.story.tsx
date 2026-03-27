import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { V2ThemeProvider } from '@/theme/v2';
import { PeriodOption } from './PeriodOption';

const meta: Meta<typeof PeriodOption> = {
  title: 'v2/PeriodSelector/PeriodOption',
  component: PeriodOption,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <V2ThemeProvider colorMode="dark">
        <div style={{ width: 260, backgroundColor: 'var(--v2-card)', padding: 8 }}>
          <Story />
        </div>
      </V2ThemeProvider>
    ),
    createStoryDecorator({ padding: false }),
  ],
};

export default meta;
type Story = StoryObj<typeof PeriodOption>;

const activePeriod = {
  id: '1',
  name: 'March 2026',
  startDate: '2026-03-01',
  periodType: 'duration' as const,
  length: 31,
  remainingDays: 14,
  numberOfTransactions: 47,
  status: 'active' as const,
  totalSpent: 125000,
  totalBudgeted: 300000,
  duration: { durationUnits: 31, durationUnit: 'days' as const },
};

const pastPeriod = {
  id: '4',
  name: 'February 2026',
  startDate: '2026-02-01',
  periodType: 'duration' as const,
  length: 28,
  remainingDays: null,
  numberOfTransactions: 32,
  status: 'past' as const,
  totalSpent: 280000,
  totalBudgeted: 300000,
  duration: { durationUnits: 28, durationUnit: 'days' as const },
};

export const Active: Story = {
  args: {
    period: activePeriod,
    isSelected: false,
    onSelect: () => {},
  },
};

export const Selected: Story = {
  args: {
    period: activePeriod,
    isSelected: true,
    onSelect: () => {},
  },
};

export const Past: Story = {
  args: {
    period: pastPeriod,
    isSelected: false,
    onSelect: () => {},
  },
};
