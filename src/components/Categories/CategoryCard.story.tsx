import type { Meta, StoryObj } from '@storybook/react';
import { CategoryCard } from './CategoryCard';

const meta: Meta<typeof CategoryCard> = {
  title: 'Components/Categories/CategoryCard',
  component: CategoryCard,
  tags: ['autodocs'],
  argTypes: {
    onEdit: { action: 'edit' },
    onDelete: { action: 'delete' },
    onClick: { action: 'click' },
  },
};

export default meta;
type Story = StoryObj<typeof CategoryCard>;

const groceriesCategory = {
  id: '1',
  name: 'Groceries',
  icon: '🛒',
  color: '#4CAF50',
  parentId: null,
  categoryType: 'Outgoing' as const,
  isArchived: false,
  description: null,
};

const salaryCategory = {
  id: '2',
  name: 'Salary',
  icon: '💰',
  color: '#2196F3',
  parentId: null,
  categoryType: 'Incoming' as const,
  isArchived: false,
  description: null,
};

const transferCategory = {
  id: '3',
  name: 'Transfer',
  icon: '🔄',
  color: '#FF9800',
  parentId: null,
  categoryType: 'Transfer' as const,
  isArchived: false,
  description: null,
};

export const Outgoing: Story = {
  args: {
    category: groceriesCategory,
    monthlySpent: 45000, // €450.00
    transactionCount: 23,
    trend: {
      direction: 'up',
      percentage: 15,
    },
  },
};

export const Incoming: Story = {
  args: {
    category: salaryCategory,
    monthlySpent: 300000, // €3,000.00
    transactionCount: 2,
    trend: {
      direction: 'down',
      percentage: 5,
    },
  },
};

export const Transfer: Story = {
  args: {
    category: transferCategory,
    monthlySpent: 100000, // €1,000.00
    transactionCount: 4,
  },
};

export const NoTrend: Story = {
  args: {
    category: {
      ...groceriesCategory,
      name: 'Entertainment',
      icon: '🎮',
      color: '#9C27B0',
    },
    monthlySpent: 15000,
    transactionCount: 8,
  },
};

export const HighActivity: Story = {
  args: {
    category: {
      ...groceriesCategory,
      name: 'Restaurants',
      icon: '🍽️',
      color: '#FF5722',
    },
    monthlySpent: 78000,
    transactionCount: 45,
    trend: {
      direction: 'up',
      percentage: 22,
    },
  },
};

export const LowActivity: Story = {
  args: {
    category: {
      ...groceriesCategory,
      name: 'Insurance',
      icon: '🛡️',
      color: '#607D8B',
    },
    monthlySpent: 25000,
    transactionCount: 1,
    trend: {
      direction: 'down',
      percentage: 2,
    },
  },
};
