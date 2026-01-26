import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, userEvent, within } from 'storybook/test';
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

    // Check if accounts are rendered
    await expect(canvas.getByText('Checking')).toBeInTheDocument();
    await expect(canvas.getByText('Savings')).toBeInTheDocument();

    // Open menu for the first account
    const menuButtons = canvas.getAllByRole('button');
    // The ActionIcon for the menu is likely the first button in the card
    await userEvent.click(menuButtons[0]);

    // Wait for menu to appear (it's in a portal, so look in body)
    const body = within(document.body);
    const deleteButton = await body.findByText('Delete Account');

    // Click delete
    await userEvent.click(deleteButton);

    // Verify account is removed
    await expect(canvas.queryByText('Checking')).not.toBeInTheDocument();
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
