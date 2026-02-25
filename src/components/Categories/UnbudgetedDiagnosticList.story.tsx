import type { Meta, StoryObj } from '@storybook/react';
import { mockUnbudgetedDiagnosticRows } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { UnbudgetedDiagnosticList } from './UnbudgetedDiagnosticList';

const meta: Meta<typeof UnbudgetedDiagnosticList> = {
  title: 'Components/Categories/UnbudgetedDiagnosticList',
  component: UnbudgetedDiagnosticList,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof UnbudgetedDiagnosticList>;

const toRowProps = (row: (typeof mockUnbudgetedDiagnosticRows)[number]) => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  spentValue: row.actualValue,
  sharePercentage: row.shareOfTotalBasisPoints / 100,
});

export const Default: Story = {
  args: {
    rows: mockUnbudgetedDiagnosticRows.map(toRowProps),
  },
};

export const Single: Story = {
  args: {
    rows: [toRowProps(mockUnbudgetedDiagnosticRows[0])],
  },
};

export const Empty: Story = {
  args: { rows: [] },
};
