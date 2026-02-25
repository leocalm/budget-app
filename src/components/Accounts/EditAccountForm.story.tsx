import type { Meta, StoryObj } from '@storybook/react';
import {
  mockAllowanceAccount,
  mockCheckingAccount,
  mockCreditCardAccount,
} from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { EditAccountForm } from './EditAccountForm';

const meta: Meta<typeof EditAccountForm> = {
  title: 'Components/Accounts/EditAccountForm',
  component: EditAccountForm,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof EditAccountForm>;

export const Checking: Story = {
  args: {
    account: mockCheckingAccount,
    onUpdated: () => {},
  },
};

export const CreditCard: Story = {
  args: {
    account: mockCreditCardAccount,
    onUpdated: () => {},
  },
};

export const Allowance: Story = {
  args: {
    account: mockAllowanceAccount,
    onUpdated: () => {},
  },
};
