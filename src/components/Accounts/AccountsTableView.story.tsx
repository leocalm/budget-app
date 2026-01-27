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
      isLoading={false}
      onDelete={handleDelete}
      onAccountUpdated={() => console.log('Account updated')}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if accounts are rendered - use getAllByText since "Checking" appears multiple times
    const checkingElements = canvas.getAllByText('Checking');
    await expect(checkingElements.length).toBeGreaterThan(0);

    const savingsElements = canvas.getAllByText('Savings');
    await expect(savingsElements.length).toBeGreaterThan(0);

    // Get menu buttons - there should be one per account
    const menuButtons = canvas.getAllByRole('button');

    // Open menu for the first account (Checking account)
    await userEvent.click(menuButtons[0]);

    // Wait for menu to appear (it's in a portal, so look in body)
    const body = within(document.body);
    const deleteButton = await body.findByText('Delete Account');

    // Click delete
    await userEvent.click(deleteButton);

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
    isLoading: true,
    onDelete: () => {},
    onAccountUpdated: () => {},
  },
};

export const Empty: Story = {
  args: {
    accounts: [],
    isLoading: false,
    onDelete: () => {},
    onAccountUpdated: () => {},
  },
};
