import type { Meta, StoryObj } from '@storybook/react';
import {
  initialVendors,
  mockAccounts,
  mockCategories,
  mockExpenseTransaction,
  mockIncomeTransaction,
  mockTransferTransaction,
} from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { EditTransactionForm } from './EditTransactionForm';

const meta: Meta<typeof EditTransactionForm> = {
  title: 'Components/Transactions/EditTransactionForm',
  component: EditTransactionForm,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof EditTransactionForm>;

export const Expense: Story = {
  args: {
    transaction: mockExpenseTransaction,
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: initialVendors,
    onSave: async () => {},
    onCancel: () => {},
  },
};

export const Income: Story = {
  args: {
    transaction: mockIncomeTransaction,
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: initialVendors,
    onSave: async () => {},
    onCancel: () => {},
  },
};

export const Transfer: Story = {
  args: {
    transaction: mockTransferTransaction,
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: initialVendors,
    onSave: async () => {},
    onCancel: () => {},
  },
};

export const Pending: Story = {
  args: {
    transaction: mockExpenseTransaction,
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: initialVendors,
    onSave: async () => {},
    onCancel: () => {},
    isPending: true,
  },
};
