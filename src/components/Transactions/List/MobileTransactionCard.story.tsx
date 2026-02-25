import type { Meta, StoryObj } from '@storybook/react';
import {
  mockExpenseTransaction,
  mockIncomeTransaction,
  mockTransferTransaction,
} from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { MobileTransactionCard } from './MobileTransactionCard';

const meta: Meta<typeof MobileTransactionCard> = {
  title: 'Components/Transactions/MobileTransactionCard',
  component: MobileTransactionCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof MobileTransactionCard>;

export const Expense: Story = {
  args: { transaction: mockExpenseTransaction },
};

export const Income: Story = {
  args: { transaction: mockIncomeTransaction },
};

export const Transfer: Story = {
  args: { transaction: mockTransferTransaction },
};
