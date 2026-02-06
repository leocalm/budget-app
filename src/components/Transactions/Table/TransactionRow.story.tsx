import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '@mantine/core';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { TransactionRow } from './TransactionRow';

const meta: Meta<typeof TransactionRow> = {
  title: 'Components/Transactions/TransactionRow',
  component: TransactionRow,
  decorators: [
    (Story) => (
      <Table
        verticalSpacing="sm"
        highlightOnHover
        striped="even"
        style={{
          background: '#151b26',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          overflow: 'hidden',
        }}
      >
        <Table.Tbody>
          <Story />
        </Table.Tbody>
      </Table>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransactionRow>;

const mockAccount: AccountResponse = {
  id: '1',
  name: 'ING',
  color: '#ff6600',
  icon: '💳',
  accountType: 'Checking',
  currency: { id: '1', name: 'Euro', symbol: '€', currency: 'EUR', decimalPlaces: 2 },
  balance: 150000,
  balancePerDay: [],
  balanceChangeThisPeriod: 0,
  transactionCount: 0,
};

const mockCategory: CategoryResponse = {
  id: 'c1',
  name: 'Comida',
  color: '#b47aff',
  icon: '🍔',
  parentId: null,
  categoryType: 'Outgoing',
};

const mockVendor: Vendor = { id: 'v1', name: "McDonald's" };

const regularTransaction: TransactionResponse = {
  id: 't1',
  description: 'Lunch at Restaurant',
  amount: 4550,
  occurredAt: '2026-01-16',
  category: mockCategory,
  fromAccount: mockAccount,
  toAccount: null,
  vendor: mockVendor,
};

const incomeTransaction: TransactionResponse = {
  id: 't3',
  description: 'Salary January',
  amount: 324500,
  occurredAt: '2026-01-01',
  category: {
    id: 'c3',
    name: 'Salary',
    color: '#00ffa3',
    icon: '💰',
    parentId: null,
    categoryType: 'Incoming',
  },
  fromAccount: mockAccount,
  toAccount: null,
  vendor: { id: 'v2', name: 'Company Inc.' },
};

const transferTransaction: TransactionResponse = {
  id: 't2',
  description: 'Savings Transfer',
  amount: 50000,
  occurredAt: '2026-01-12',
  category: {
    id: 'c2',
    name: 'Transferência',
    color: '#00d4ff',
    icon: '💸',
    parentId: null,
    categoryType: 'Transfer',
  },
  fromAccount: mockAccount,
  toAccount: {
    id: '2',
    name: 'Poupança',
    color: '#00ffa3',
    icon: '🏦',
    accountType: 'Savings',
    currency: { id: '1', name: 'Euro', symbol: '€', currency: 'EUR', decimalPlaces: 2 },
    balance: 500000,
    balancePerDay: [],
    balanceChangeThisPeriod: 0,
    transactionCount: 0,
  },
  vendor: null,
};

export const Outgoing: Story = {
  args: {
    transaction: regularTransaction,
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const Incoming: Story = {
  args: {
    transaction: incomeTransaction,
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const Transfer: Story = {
  args: {
    transaction: transferTransaction,
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const WithAnimationDelay: Story = {
  args: {
    transaction: regularTransaction,
    onEdit: () => {},
    onDelete: () => {},
    animationDelay: 0.2,
  },
};
