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
  },
};