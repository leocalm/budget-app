import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { Vendor } from '@/types/vendor';
import { TransactionFormProvider, useTransactionForm } from './TransactionFormContext';
import { TransactionFormFields } from './TransactionFormFields';

const meta: Meta<typeof TransactionFormFields> = {
  title: 'Components/Transactions/TransactionFormFields',
  component: TransactionFormFields,
  decorators: [
    (Story) => {
      const form = useTransactionForm({
        initialValues: {
          description: '',
          amount: 0,
          occurredAt: '',
          fromAccountName: null,
          toAccountName: null,
          categoryName: null,
          vendorName: '',
        },
      });
      return (
        <TransactionFormProvider form={form}>
          <Story />
        </TransactionFormProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof TransactionFormFields>;

const mockAccounts: AccountResponse[] = [
  {
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
    isArchived: false,
  },
];

const mockCategories: CategoryResponse[] = [
  {
    id: 'c1',
    name: 'Food',
    color: 'blue',
    icon: 'shopping-cart',
    parentId: null,
    categoryType: 'Outgoing',
    isArchived: false,
    description: null,
  },
];

const mockVendors: Vendor[] = [{ id: 'v1', name: 'Supermarket', archived: false }];

const accountsByName = new Map(mockAccounts.map((a) => [a.name, a]));
const categoriesByName = new Map(mockCategories.map((c) => [c.name, c]));
const vendorsByName = new Map(mockVendors.map((v) => [v.name, v]));

export const Default: Story = {
  args: {
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: mockVendors,
    accountsByName,
    categoriesByName,
    vendorsByName,
  },
};
