import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  initialTransactions,
  initialVendors,
  mockAccounts,
  mockCategories,
} from '@/mocks/budgetData';
import type { Transaction, TransactionResponse } from '@/types/transaction';
import type { Vendor } from '@/types/vendor';
import { TransactionsTableView } from './TransactionsTableView';

const meta: Meta<typeof TransactionsTableView> = {
  title: 'Components/Transactions/TransactionsTableView',
  component: TransactionsTableView,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TransactionsTableView>;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function txResponseFromPayload(params: { payload: Transaction; id: string }): TransactionResponse {
  const { payload, id } = params;

  // The UI mostly needs these fields; keep it consistent with your app’s shapes.
  return {
    id,
    description: payload.description,
    occurredAt: payload.occurredAt,
    amount: payload.amount,
    category: payload.category!,
    fromAccount: payload.fromAccount!,
    toAccount: payload.toAccount ?? null,
    vendor: payload.vendor ?? null,
  };
}

const InteractiveTransactionsWrapper = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>(initialTransactions);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);

  const vendorsByName = useMemo(() => new Map(vendors.map((v) => [v.name, v])), [vendors]);

  const createVendor = async (payload: Pick<Vendor, 'name'>): Promise<Vendor> => {
    await delay(250);

    const name = payload.name.trim();
    if (!name) {
      throw new Error('Vendor name required');
    }

    const existing = vendorsByName.get(name);
    if (existing) {
      return existing;
    }

    const created: Vendor = { id: `ven-${Date.now()}`, name };
    setVendors((prev) => [created, ...prev]);
    return created;
  };

  const createTransaction = async (payload: Transaction) => {
    await delay(300);

    const newTx = txResponseFromPayload({ payload, id: `tx-${Date.now()}` });
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const deleteTransaction = async (id: string) => {
    await delay(200);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TransactionsTableView
      transactions={transactions}
      isLoading={false}
      isError={false}
      insertEnabled
      accounts={mockAccounts}
      categories={mockCategories}
      vendors={vendors}
      createTransaction={createTransaction}
      deleteTransaction={deleteTransaction}
      createVendor={createVendor}
    />
  );
};

export const InteractiveCreateDelete: Story = {
  render: () => <InteractiveTransactionsWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Example: create a new transaction via the form
    await userEvent.type(canvas.getByLabelText(/date/i), '2026-01-19');
    await userEvent.type(canvas.getByLabelText(/description/i), 'Storybook test tx');

    // Select inputs vary depending on Mantine/Select implementation.
    // This is the general idea; you may need to adjust queries:
    const account = canvas.getByLabelText(/account/i);
    // Open the dropdown (clicking the input is usually enough)
    await userEvent.click(account);

    // Option is rendered in a portal => search in document.body
    await userEvent.click(await body.findByRole('option', { name: 'Savings' }));

    // Assert the selection took effect (Mantine shows selected value in the input)
    await expect(account).toHaveValue('Savings');

    const category = canvas.getByLabelText(/category/i);
    await userEvent.click(category);

    // Option is rendered in a portal => search in document.body
    await userEvent.click(await body.findByRole('option', { name: 'Food' }));

    // Assert the selection took effect (Mantine shows selected value in the input)
    await expect(category).toHaveValue('Food');

    await userEvent.type(canvas.getByLabelText(/vendor/i), 'Supermarket');

    await userEvent.clear(canvas.getByLabelText(/amount/i));
    await userEvent.type(canvas.getByLabelText(/amount/i), '12.34');

    // Submit (desktop has a check icon button; mobile has "Create Transaction")
    // Prefer the visible button if present:
    const submit =
      canvas.getByLabelText(/Create Transaction/i) ??
      canvas.getByRole('button', { name: /check/i, hidden: true });

    await userEvent.click(submit);

    // Assert the new row/card appears
    await expect(await canvas.findByText('Storybook test tx')).toBeInTheDocument();

    await userEvent.click(canvas.getByLabelText(/Menu for transaction storybook test tx/i));

    await expect(
      await canvas.findByLabelText('Delete transaction storybook test tx')
    ).toBeInTheDocument();
    // Click the delete button for that specific transaction (assuming you made the label unique)
    await userEvent.click(canvas.getByLabelText(/Delete transaction storybook test tx/i));

    // Wait for state update / re-render
    await waitFor(() => {
      expect(canvas.queryByText('Storybook test tx')).not.toBeInTheDocument();
    });
  },
};

export const Loading: Story = {
  args: {
    transactions: undefined,
    isLoading: true,
    isError: false,
    insertEnabled: true,
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: initialVendors,
    createTransaction: async () => undefined,
    deleteTransaction: async () => undefined,
    createVendor: async () => ({ id: 'ven-x', name: 'Temp' }),
  },
};

export const ErrorStory: Story = {
  args: {
    transactions: undefined,
    isLoading: false,
    isError: true,
    insertEnabled: true,
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: initialVendors,
    createTransaction: async () => undefined,
    deleteTransaction: async () => undefined,
    createVendor: async () => ({ id: 'ven-x', name: 'Temp' }),
  },
};
