import type { Meta, StoryObj } from '@storybook/react';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { TransactionList } from './TransactionList';

const meta: Meta<typeof TransactionList> = {
  title: 'Components/Transactions/TransactionList',
  component: TransactionList,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TransactionList>;

const mockAccount: AccountResponse = {
  id: '1',
  name: 'Main Checking',
  color: '#228be6',
  icon: 'wallet',
  accountType: 'Checking',
  currency: { id: '1', name: 'Euro', symbol: '€', currency: 'EUR', decimalPlaces: 2 },
  balance: 150000,
};

const mockCategory: CategoryResponse = {
  id: 'c1',
  name: 'Food',
  color: 'blue',
  icon: 'shopping-cart',
  parentId: null,
  categoryType: 'Outgoing',
};

const mockVendor: Vendor = { id: 'v1', name: 'Supermarket' };

const mockTransactions: TransactionResponse[] = [
  {
    id: 't1',
    description: 'Grocery Shopping',
    amount: 5000,
    occurredAt: '2023-10-14',
    category: mockCategory,
    fromAccount: mockAccount,
    toAccount: null,
    vendor: mockVendor,
  },
  {
    id: 't2',
    description: 'Salary',
    amount: 300000,
    occurredAt: '2023-10-01',
    category: {
      ...mockCategory,
      categoryType: 'Incoming',
      name: 'Salary',
      icon: 'cash',
      color: 'green',
    },
    fromAccount: mockAccount,
    toAccount: null,
    vendor: { id: 'v2', name: 'Employer' },
  },
];

export const Default: Story = {
  args: {
    transactions: mockTransactions,
    deleteTransaction: async () => {},
  },
};

export const Empty: Story = {
  args: {
    transactions: [],
    deleteTransaction: async () => {},
  },
};
