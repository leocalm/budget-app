import type { Meta, StoryObj } from '@storybook/react';
import { mockIncomingCategory, mockOutgoingCategory } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CategoryCard } from './CategoryCard';

const meta: Meta<typeof CategoryCard> = {
  title: 'Components/Categories/CategoryCard',
  component: CategoryCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CategoryCard>;

export const Default: Story = {
  args: {
    category: mockOutgoingCategory,
    monthlySpent: 42000,
    transactionCount: 12,
    onEdit: () => {},
    onDelete: () => {},
    onClick: () => {},
  },
};

export const WithTrendUp: Story = {
  args: {
    category: mockOutgoingCategory,
    monthlySpent: 42000,
    transactionCount: 12,
    trend: { direction: 'up', percentage: 15 },
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const WithTrendDown: Story = {
  args: {
    category: mockOutgoingCategory,
    monthlySpent: 42000,
    transactionCount: 12,
    trend: { direction: 'down', percentage: 8 },
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const Incoming: Story = {
  args: {
    category: mockIncomingCategory,
    monthlySpent: 300000,
    transactionCount: 3,
    onEdit: () => {},
    onDelete: () => {},
  },
};
