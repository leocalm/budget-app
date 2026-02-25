import type { Meta, StoryObj } from '@storybook/react';
import { mockAllowanceAccount } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { AllowanceRangeBar } from './AllowanceRangeBar';

const meta: Meta<typeof AllowanceRangeBar> = {
  title: 'Components/Accounts/AllowanceRangeBar',
  component: AllowanceRangeBar,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof AllowanceRangeBar>;

export const Default: Story = {
  args: { account: mockAllowanceAccount },
};

export const NoNextTransfer: Story = {
  args: {
    account: { ...mockAllowanceAccount, nextTransferAmount: undefined },
  },
};

export const LowBalance: Story = {
  args: {
    account: { ...mockAllowanceAccount, balance: 500 },
  },
};
