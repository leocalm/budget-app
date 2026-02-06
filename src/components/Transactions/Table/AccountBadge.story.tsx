import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Group } from '@mantine/core';
import { AccountBadge } from './AccountBadge';

const meta: Meta<typeof AccountBadge> = {
  title: 'Components/Transactions/AccountBadge',
  component: AccountBadge,
  decorators: [
    (Story) => (
      <Box p="lg" style={{ background: '#0a0e14' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AccountBadge>;

const mockCurrency = {
  id: '1',
  name: 'Euro',
  symbol: '€',
  currency: 'EUR',
  decimalPlaces: 2,
};

export const Checking: Story = {
  args: {
    account: {
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
    },
  },
};

export const Savings: Story = {
  args: {
    account: {
      id: '2',
      name: 'Poupança',
      color: '#00ffa3',
      icon: '🏦',
      accountType: 'Savings',
      currency: mockCurrency,
      balance: 500000,
      balancePerDay: [],
      balanceChangeThisPeriod: 0,
      transactionCount: 0,
    },
  },
};

export const CreditCard: Story = {
  args: {
    account: {
      id: '3',
      name: 'AMEX',
      color: '#00d4ff',
      icon: '💳',
      accountType: 'CreditCard',
      currency: mockCurrency,
      balance: -25000,
      balancePerDay: [],
      balanceChangeThisPeriod: 0,
      transactionCount: 0,
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <Group gap="md">
      <AccountBadge
        account={{
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
        }}
      />
      <AccountBadge
        account={{
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
        }}
      />
      <AccountBadge
        account={{
          id: '3',
          name: 'AMEX',
          color: '#00d4ff',
          icon: '💳',
          accountType: 'CreditCard',
          currency: mockCurrency,
          balance: -25000,
          balancePerDay: [],
          balanceChangeThisPeriod: 0,
          transactionCount: 0,
        }}
      />
      <AccountBadge
        account={{
          id: '4',
          name: 'Revolut',
          color: '#b47aff',
          icon: '💳',
          accountType: 'Checking',
          currency: mockCurrency,
          balance: 75000,
          balancePerDay: [],
          balanceChangeThisPeriod: 0,
          transactionCount: 0,
        }}
      />
    </Group>
  ),
};
