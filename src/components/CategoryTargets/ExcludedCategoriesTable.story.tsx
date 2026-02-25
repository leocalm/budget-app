import type { Meta, StoryObj } from '@storybook/react';
import { mockCategoryTargets } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { ExcludedCategoriesTable } from './ExcludedCategoriesTable';

const meta: Meta<typeof ExcludedCategoriesTable> = {
  title: 'Components/CategoryTargets/ExcludedCategoriesTable',
  component: ExcludedCategoriesTable,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof ExcludedCategoriesTable>;

export const Default: Story = {
  args: {
    rows: mockCategoryTargets.excludedCategories,
    onInclude: () => {},
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    onInclude: () => {},
  },
};
