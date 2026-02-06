import type { Meta, StoryObj } from '@storybook/react';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { MobileTransactionCard } from './MobileTransactionCard';

const meta: Meta<typeof MobileTransactionCard> = {
  title: 'Components/Transactions/MobileTransactionCard',
  component: MobileTransactionCard,
};

export default meta;
type Story = StoryObj<typeof MobileTransactionCard>;

const mockAccount: AccountResponse = {
  id: '1',
  name: 'Main Checking',
  color: '#228be6',
  icon: 'wallet',
  accountType: 'Checking',
  currency: { id: '1', name: 'Euro', symbol: '€', currency: 'EUR', decimalPlaces: 2 },
  balance: 150000,
  balancePerDay: [],
  balanceChangeThisPeriod: 0,
  transactionCount: 0,
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

const mockTransaction: TransactionResponse = {
  id: 't1',
  description: 'Grocery Shopping',
  amount: 5000,
  occurredAt: '2023-10-14',
  category: mockCategory,
  fromAccount: mockAccount,
  toAccount: null,
  vendor: mockVendor,
};

export const Default: Story = {
  args: {
    transaction: mockTransaction,
  },
};

export const Transfer: Story = {
  args: {
    transaction: {
      ...mockTransaction,
      category: {
        ...mockCategory,
        categoryType: 'Transfer',
        name: 'Transfer',
        icon: 'arrows-left-right',
      },
      toAccount: { ...mockAccount, id: '2', name: 'Savings', color: 'green' },
      description: '',
    },
  },
};
