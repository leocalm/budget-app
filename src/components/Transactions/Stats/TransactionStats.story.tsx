import { Meta } from '@storybook/react';
import { TransactionStats } from './TransactionStats';

const meta: Meta<typeof TransactionStats> = {
  title: 'Components/Transactions/TransactionStats',
  component: TransactionStats,
};

export default meta;
type Story = Meta<typeof TransactionStats>;

export const Default: Story = {
  args: {
    income: 100000,
    balance: 10000,
    expenses: 90000,
  },
};
