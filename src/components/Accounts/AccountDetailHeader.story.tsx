import type { Meta, StoryObj } from '@storybook/react';
import { mockAccountDetail, mockCheckingAccount } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { AccountDetailHeader } from './AccountDetailHeader';

const meta: Meta<typeof AccountDetailHeader> = {
  title: 'Components/Accounts/AccountDetailHeader',
  component: AccountDetailHeader,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof AccountDetailHeader>;

export const Default: Story = {
  args: {
    account: mockCheckingAccount,
    detail: mockAccountDetail,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    account: mockCheckingAccount,
    detail: undefined,
    isLoading: true,
  },
};

export const NegativeChange: Story = {
  args: {
    account: mockCheckingAccount,
    detail: { ...mockAccountDetail, balanceChange: -12000 },
    isLoading: false,
  },
};
