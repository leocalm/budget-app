import type { Meta, StoryObj } from '@storybook/react';
import { mockCategoryTargets } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CategoryTargetTable } from './CategoryTargetTable';

const meta: Meta<typeof CategoryTargetTable> = {
  title: 'Components/CategoryTargets/CategoryTargetTable',
  component: CategoryTargetTable,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CategoryTargetTable>;

export const Default: Story = {
  args: {
    title: 'Outgoing',
    rows: mockCategoryTargets.outgoingTargets,
    editedValues: new Map(),
    onValueChange: () => {},
    onExclude: () => {},
  },
};

export const WithEdits: Story = {
  args: {
    title: 'Outgoing',
    rows: mockCategoryTargets.outgoingTargets,
    editedValues: new Map([['cat-out-1', 60000]]),
    onValueChange: () => {},
    onExclude: () => {},
  },
};

export const Incoming: Story = {
  args: {
    title: 'Incoming',
    rows: mockCategoryTargets.incomingTargets,
    editedValues: new Map(),
    onValueChange: () => {},
    onExclude: () => {},
  },
};
