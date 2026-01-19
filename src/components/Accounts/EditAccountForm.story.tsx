import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockAccounts } from '@/mocks/budgetData';
import { EditAccountForm } from './EditAccountForm';

const queryClient = new QueryClient();

const meta: Meta<typeof EditAccountForm> = {
  title: 'Components/Accounts/EditAccountForm',
  component: EditAccountForm,
  argTypes: {
    onUpdated: { action: 'updated' },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EditAccountForm>;

export const Default: Story = {
  args: {
    account: mockAccounts[0],
  },
};

export const WithSavings: Story = {
  args: {
    account: mockAccounts[1],
  },
};
