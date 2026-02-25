import type { Meta, StoryObj } from '@storybook/react';
import { mockCheckingAccount, mockSavingsAccount } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { StandardRangeBar } from './StandardRangeBar';

const meta: Meta<typeof StandardRangeBar> = {
  title: 'Components/Accounts/StandardRangeBar',
  component: StandardRangeBar,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof StandardRangeBar>;

export const Default: Story = {
  args: { account: mockCheckingAccount },
};

export const Savings: Story = {
  args: { account: mockSavingsAccount },
};

export const LowBalance: Story = {
  args: {
    account: { ...mockCheckingAccount, balance: 2000 },
  },
};

export const NegativeBalance: Story = {
  args: {
    account: { ...mockCheckingAccount, balance: -15000 },
  },
};
