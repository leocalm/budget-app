import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { mockAccounts } from '@/mocks/budgetData';
import { AccountResponse } from '@/types/account';
import { AccountsTableView } from './AccountsTableView';

const queryClient = new QueryClient();

const meta: Meta<typeof AccountsTableView> = {
  title: 'Components/Accounts/AccountsTableView',
  component: AccountsTableView,
  parameters: {
    layout: 'padded',
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
type Story = StoryObj<typeof AccountsTableView>;

const InteractiveWrapper = () => {
  const [accounts, setAccounts] = useState<AccountResponse[]>(mockAccounts);

  const handleDelete = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AccountsTableView
      accounts={accounts}
      isLocked={false}
      isLoading={false}
      isError={false}
      onRetry={() => {}}
      onDelete={handleDelete}
      onAccountUpdated={() => {}}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if accounts are rendered
    const checkingElements = canvas.getAllByText('Checking');
    await expect(checkingElements.length).toBeGreaterThan(0);

    const savingsElements = canvas.getAllByText('Savings');
    await expect(savingsElements.length).toBeGreaterThan(0);

    // Find the delete action buttons by title attribute
    const deleteButtons = canvas.getAllByTitle('Delete');
    await expect(deleteButtons.length).toBeGreaterThan(0);

    // Click delete for the first account (Checking account)
    await userEvent.click(deleteButtons[0]);

    // Wait for account to be removed - all "Checking" texts should be gone
    await waitFor(() => {
      const remainingChecking = canvas.queryAllByText('Checking');
      expect(remainingChecking.length).toBe(0);
    });

    // Verify "Savings" account is still present
    const remainingSavings = canvas.getAllByText('Savings');
    await expect(remainingSavings.length).toBeGreaterThan(0);
  },
};

export const Loading: Story = {
  args: {
    accounts: undefined,
    isLocked: false,
    isLoading: true,
    isError: false,
    onRetry: () => {},
    onDelete: () => {},
    onAccountUpdated: () => {},
  },
};

export const Empty: Story = {
  args: {
    accounts: [],
    isLocked: false,
    isLoading: false,
    isError: false,
    onRetry: () => {},
    onDelete: () => {},
    onAccountUpdated: () => {},
  },
};
