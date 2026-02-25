import type { Meta, StoryObj } from '@storybook/react';
import { mockCategoriesManagement } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CategoriesManagement } from './CategoriesManagement';

const meta: Meta<typeof CategoriesManagement> = {
  title: 'Components/Categories/CategoriesManagement',
  component: CategoriesManagement,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CategoriesManagement>;

export const Default: Story = {
  args: {
    data: mockCategoriesManagement,
    isLoading: false,
    isError: false,
    onRetry: () => {},
    onEdit: () => {},
    onArchive: () => {},
    onRestore: () => {},
    onDelete: () => {},
    onAddSubcategory: () => {},
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
    data: undefined,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    isError: true,
    data: undefined,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    data: { incoming: [], outgoing: [], archived: [] },
  },
};
