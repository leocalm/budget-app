import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mantine/core';
import { BudgetPeriod } from '@/types/budget';
import { BudgetPeriodSelector } from './BudgetPeriodSelector';

const mockPeriods: BudgetPeriod[] = [
  {
    id: 'period-current',
    name: 'February 2026',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
  },
  {
    id: 'period-next',
    name: 'March 2026',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
  },
  {
    id: 'period-prev',
    name: 'January 2026',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  },
];

const meta: Meta<typeof BudgetPeriodSelector> = {
  title: 'Components/BudgetPeriodSelector',
  component: BudgetPeriodSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box maw={360} p="md">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BudgetPeriodSelector>;

interface StatefulSelectorProps {
  periods?: BudgetPeriod[];
  selectedPeriodId?: string | null;
}

const StatefulSelector = ({ periods, selectedPeriodId }: StatefulSelectorProps) => {
  const [value, setValue] = useState(selectedPeriodId ?? null);

  return (
    <BudgetPeriodSelector
      periods={periods ?? []}
      selectedPeriodId={value}
      onPeriodChange={setValue}
    />
  );
};

export const Default: Story = {
  render: (args) => (
    <StatefulSelector periods={args.periods} selectedPeriodId={args.selectedPeriodId} />
  ),
  args: {
    periods: mockPeriods,
    selectedPeriodId: 'period-current',
  },
};

export const NoPeriods: Story = {
  render: (args) => (
    <StatefulSelector periods={args.periods} selectedPeriodId={args.selectedPeriodId} />
  ),
  args: {
    periods: [],
    selectedPeriodId: null,
  },
};

export const Mobile: Story = {
  render: (args) => (
    <StatefulSelector periods={args.periods} selectedPeriodId={args.selectedPeriodId} />
  ),
  args: {
    periods: mockPeriods,
    selectedPeriodId: 'period-current',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
