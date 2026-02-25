import type { Meta, StoryObj } from '@storybook/react';
import { mockCategoryWithStats } from '@/mocks/budgetData';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { CategoriesTable } from './CategoriesTable';

const meta: Meta<typeof CategoriesTable> = {
  title: 'Components/Categories/CategoriesTable',
  component: CategoriesTable,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CategoriesTable>;

export const Default: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.success('/api/v1/categories', mockCategoryWithStats)] },
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/categories')] },
  },
};

export const Empty: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.empty('/api/v1/categories')] },
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.error('/api/v1/categories')] },
  },
};
