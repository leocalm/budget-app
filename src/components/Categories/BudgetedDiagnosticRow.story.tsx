import type { Meta, StoryObj } from '@storybook/react';
import { mockBudgetedDiagnosticRows } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { BudgetedDiagnosticRow } from './BudgetedDiagnosticRow';

const meta: Meta<typeof BudgetedDiagnosticRow> = {
  title: 'Components/Categories/BudgetedDiagnosticRow',
  component: BudgetedDiagnosticRow,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof BudgetedDiagnosticRow>;

const toRowProps = (row: (typeof mockBudgetedDiagnosticRows)[number]) => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  budgetedValue: row.budgetedValue,
  spentValue: row.actualValue,
  varianceValue: row.varianceValue,
  progressPercentage: row.progressBasisPoints / 100,
  stabilityHistory: row.recentClosedPeriods.map((p) => !p.isOutsideTolerance),
});

export const UnderBudget: Story = {
  args: toRowProps(mockBudgetedDiagnosticRows[0]),
};

export const NearLimit: Story = {
  args: toRowProps(mockBudgetedDiagnosticRows[1]),
};

export const OverBudget: Story = {
  args: {
    ...toRowProps(mockBudgetedDiagnosticRows[0]),
    spentValue: 60000,
    varianceValue: 10000,
    progressPercentage: 120,
  },
};
