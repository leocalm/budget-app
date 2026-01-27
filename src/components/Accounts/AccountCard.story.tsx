import type { Meta, StoryObj } from '@storybook/react';
import { mockAccounts } from '@/mocks/budgetData';
import { AccountCard } from './AccountCard';

const meta: Meta<typeof AccountCard> = {
  title: 'Components/Accounts/AccountCard',
  component: AccountCard,
  tags: ['autodocs'],
  argTypes: {
    onEdit: { action: 'edit' },
    onDelete: { action: 'delete' },
  },
};

export default meta;
type Story = StoryObj<typeof AccountCard>;

export const Default: Story = {
  args: {
    account: mockAccounts[0],
    balanceHistory: [
      { date: '2026-01-01', balance: 145000 },
      { date: '2026-01-05', balance: 147000 },
      { date: '2026-01-10', balance: 148500 },
      { date: '2026-01-15', balance: 150000 },
    ],
    monthlySpent: 12500,
    transactionCount: 23,
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
    onViewDetails: () => console.log('View details clicked'),
  },
};

export const WithSpendLimit: Story = {
  args: {
    account: {
      ...mockAccounts[0],
      name: 'Spending Account',
      color: 'orange',
      spendLimit: 50000, // 500.00
    },
    balanceHistory: [
      { date: '2026-01-01', balance: 145000 },
      { date: '2026-01-05', balance: 147000 },
      { date: '2026-01-10', balance: 148500 },
      { date: '2026-01-15', balance: 150000 },
    ],
    monthlySpent: 12500,
    transactionCount: 23,
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
    onViewDetails: () => console.log('View details clicked'),
  },
};
