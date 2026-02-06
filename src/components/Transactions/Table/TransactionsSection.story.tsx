import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mantine/core';
import { AccountResponse } from '@/types/account';
import { TransactionResponse } from '@/types/transaction';
import { TransactionsSection } from './TransactionsSection';

const meta: Meta<typeof TransactionsSection> = {
  title: 'Components/Transactions/TransactionsSection',
  component: TransactionsSection,
  decorators: [
    (Story) => (
      <Box p="xl" style={{ background: '#0a0e14', minHeight: '100vh' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransactionsSection>;

const mockCurrency = {
  id: '1',
  name: 'Euro',
  symbol: '€',
  currency: 'EUR',
  decimalPlaces: 2,
};

const mockAccount: AccountResponse = {
  id: '1',
  name: 'ING',
  color: '#ff6600',
  icon: '💳',
  accountType: 'Checking',
  currency: mockCurrency,
  balance: 150000,
  balancePerDay: [],
  balanceChangeThisPeriod: 0,
  transactionCount: 0,
};

const mockTransactions: TransactionResponse[] = [
  {
    id: 't1',
    description: 'Presente Lick',
    amount: 499,
    occurredAt: '2026-01-16',
    category: {
      id: 'c1',
      name: 'Outros',
      color: '#ff6b9d',
      icon: '🎁',
      parentId: null,
      categoryType: 'Outgoing',
    },
    fromAccount: mockAccount,
    toAccount: null,
    vendor: { id: 'v1', name: 'Hema' },
  },
  {
    id: 't2',
    description: 'Xarope para tosse',
    amount: 1848,
    occurredAt: '2026-01-16',
    category: {
      id: 'c2',
      name: 'Farmacia',
      color: '#ffa940',
      icon: '💊',
      parentId: null,
      categoryType: 'Outgoing',
    },
    fromAccount: mockAccount,
    toAccount: null,
    vendor: { id: 'v2', name: 'Etos' },
  },
  {
    id: 't3',
    description: 'Netflix',
    amount: 1599,
    occurredAt: '2026-01-16',
    category: {
      id: 'c3',
      name: 'Netflix',
      color: '#ff6b9d',
      icon: '📺',
      parentId: null,
      categoryType: 'Outgoing',
    },
    fromAccount: mockAccount,
    toAccount: null,
    vendor: { id: 'v3', name: 'Netflix' },
  },
  {
    id: 't4',
    description: 'Mercado',
    amount: 7737,
    occurredAt: '2026-01-13',
    category: {
      id: 'c4',
      name: 'Mercado',
      color: '#ffa940',
      icon: '🛒',
      parentId: null,
      categoryType: 'Outgoing',
    },
    fromAccount: mockAccount,
    toAccount: null,
    vendor: { id: 'v4', name: 'Albert Heijn' },
  },
  {
    id: 't5',
    description: 'Saque Poupança',
    amount: 50000,
    occurredAt: '2026-01-12',
    category: {
      id: 'c5',
      name: 'Transferência',
      color: '#00d4ff',
      icon: '💸',
      parentId: null,
      categoryType: 'Transfer',
    },
    fromAccount: {
      id: '2',
      name: 'Poupança ING',
      color: '#00ffa3',
      icon: '🏦',
      accountType: 'Savings',
      currency: mockCurrency,
      balance: 500000,
      balancePerDay: [],
      balanceChangeThisPeriod: 0,
      transactionCount: 0,
    },
    toAccount: mockAccount,
    vendor: null,
  },
  {
    id: 't6',
    description: 'McDonalds',
    amount: 1800,
    occurredAt: '2026-01-12',
    category: {
      id: 'c6',
      name: 'Comida',
      color: '#b47aff',
      icon: '🍔',
      parentId: null,
      categoryType: 'Outgoing',
    },
    fromAccount: mockAccount,
    toAccount: null,
    vendor: { id: 'v5', name: 'McDonalds' },
  },
];

const TransactionsSectionWrapper = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <TransactionsSection
      transactions={mockTransactions}
      period="January 2026"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  );
};

export const Default: Story = {
  render: () => <TransactionsSectionWrapper />,
};

export const Empty: Story = {
  render: () => (
    <TransactionsSection
      transactions={[]}
      period="January 2026"
      searchQuery=""
      onSearchChange={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  ),
};
