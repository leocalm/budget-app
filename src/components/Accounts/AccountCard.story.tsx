import type { Meta, StoryObj } from '@storybook/react';
import {
  mockAllowanceAccount,
  mockBalanceHistory,
  mockCheckingAccount,
  mockCreditCardAccount,
  mockSavingsAccount,
} from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { AccountCard } from './AccountCard';

const meta: Meta<typeof AccountCard> = {
  title: 'Components/Accounts/AccountCard',
  component: AccountCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof AccountCard>;

const noop = () => {};

export const Checking: Story = {
  args: {
    account: mockCheckingAccount,
    balanceHistory: mockBalanceHistory,
    monthlySpent: 85000,
    transactionCount: 23,
    onEdit: noop,
    onDelete: noop,
    onViewDetails: noop,
  },
};

export const Savings: Story = {
  args: {
    account: mockSavingsAccount,
    balanceHistory: mockBalanceHistory,
    monthlySpent: 0,
    transactionCount: 2,
    onEdit: noop,
    onDelete: noop,
    onViewDetails: noop,
  },
};

export const CreditCard: Story = {
  args: {
    account: mockCreditCardAccount,
    balanceHistory: mockBalanceHistory,
    monthlySpent: 75000,
    transactionCount: 15,
    onEdit: noop,
    onDelete: noop,
    onViewDetails: noop,
  },
};

export const Allowance: Story = {
  args: {
    account: mockAllowanceAccount,
    balanceHistory: mockBalanceHistory,
    monthlySpent: 12000,
    transactionCount: 8,
    onEdit: noop,
    onDelete: noop,
    onViewDetails: noop,
    onTransferOrPayBill: noop,
  },
};

export const NegativeBalance: Story = {
  args: {
    account: { ...mockCreditCardAccount, balance: -180000 },
    balanceHistory: mockBalanceHistory,
    monthlySpent: 180000,
    transactionCount: 22,
    onEdit: noop,
    onDelete: noop,
    onViewDetails: noop,
  },
};
