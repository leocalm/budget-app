import type { Meta, StoryObj } from '@storybook/react';
import { mockCategoryTargets } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CategoryTargetRow } from './CategoryTargetRow';

const meta: Meta<typeof CategoryTargetRow> = {
  title: 'Components/CategoryTargets/CategoryTargetRow',
  component: CategoryTargetRow,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CategoryTargetRow>;

export const WithTarget: Story = {
  args: {
    row: mockCategoryTargets.outgoingTargets[0],
    editedValue: null,
    onValueChange: () => {},
    onExclude: () => {},
  },
};

export const NoTarget: Story = {
  args: {
    row: mockCategoryTargets.outgoingTargets[2],
    editedValue: null,
    onValueChange: () => {},
    onExclude: () => {},
  },
};

export const EditedValue: Story = {
  args: {
    row: mockCategoryTargets.outgoingTargets[0],
    editedValue: 55000,
    onValueChange: () => {},
    onExclude: () => {},
  },
};

export const PositiveVariance: Story = {
  args: {
    row: mockCategoryTargets.outgoingTargets[1],
    editedValue: null,
    onValueChange: () => {},
    onExclude: () => {},
  },
};
