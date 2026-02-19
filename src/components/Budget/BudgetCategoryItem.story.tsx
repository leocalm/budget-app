import type { Meta, StoryObj } from '@storybook/react';
import { BudgetCategoryItem } from './BudgetCategoryItem';

const meta: Meta<typeof BudgetCategoryItem> = {
  title: 'Components/Budget/BudgetCategoryItem',
  component: BudgetCategoryItem,
  tags: ['autodocs'],
  argTypes: {
    onEditStart: { action: 'edit-start' },
    onEditCancel: { action: 'edit-cancel' },
    onEditChange: { action: 'edit-change' },
    onEditSave: { action: 'edit-save' },
    onDelete: { action: 'delete' },
  },
};

export default meta;
type Story = StoryObj<typeof BudgetCategoryItem>;

const mockCategory = {
  id: '1',
  categoryId: 'cat-1',
  budgetPeriodId: 'period-1',
  category: {
    id: 'cat-1',
    name: 'Groceries',
    icon: '🛒',
    color: '#4CAF50',
    parentId: null,
    categoryType: 'Outgoing' as const,
    isArchived: false,
    description: null,
  },
  budgetedValue: 50000, // €500.00 in cents
};

export const OnTrack: Story = {
  args: {
    category: mockCategory,
    spent: 25000, // €250.00 (50%)
    isEditing: false,
    editingValue: 500,
    onEditStart: () => {},
    onEditCancel: () => {},
    onEditChange: () => {},
    onEditSave: () => {},
    onDelete: () => {},
  },
};

export const NearLimit: Story = {
  args: {
    category: mockCategory,
    spent: 45000, // €450.00 (90%)
    isEditing: false,
    editingValue: 500,
    onEditStart: () => {},
    onEditCancel: () => {},
    onEditChange: () => {},
    onEditSave: () => {},
    onDelete: () => {},
  },
};

export const OverBudget: Story = {
  args: {
    category: mockCategory,
    spent: 60000, // €600.00 (120%)
    isEditing: false,
    editingValue: 500,
    onEditStart: () => {},
    onEditCancel: () => {},
    onEditChange: () => {},
    onEditSave: () => {},
    onDelete: () => {},
  },
};

export const NotStarted: Story = {
  args: {
    category: mockCategory,
    spent: 0,
    isEditing: false,
    editingValue: 500,
    onEditStart: () => {},
    onEditCancel: () => {},
    onEditChange: () => {},
    onEditSave: () => {},
    onDelete: () => {},
  },
};

export const EditingMode: Story = {
  args: {
    category: mockCategory,
    spent: 25000,
    isEditing: true,
    editingValue: 500,
    onEditStart: () => {},
    onEditCancel: () => {},
    onEditChange: () => {},
    onEditSave: () => {},
    onDelete: () => {},
  },
};

export const RestaurantCategory: Story = {
  args: {
    category: {
      ...mockCategory,
      categoryId: 'cat-2',
      category: {
        ...mockCategory.category,
        id: 'cat-2',
        name: 'Restaurants',
        icon: '🍽️',
        color: '#FF9800',
      },
      budgetedValue: 30000, // €300.00
    },
    spent: 18000, // €180.00 (60%)
    isEditing: false,
    editingValue: 300,
    onEditStart: () => {},
    onEditCancel: () => {},
    onEditChange: () => {},
    onEditSave: () => {},
    onDelete: () => {},
  },
};
