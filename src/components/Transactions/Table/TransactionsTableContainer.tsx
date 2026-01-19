import React from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTransaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { useCreateVendor, useVendors } from '@/hooks/useVendor';
import { TransactionResponse } from '@/types/transaction';
import { TransactionsTableView } from './TransactionsTableView';

export interface TransactionsTableProps {
  transactions: TransactionResponse[] | undefined;
  isLoading: boolean | undefined;
  isError: boolean | undefined;
  insertEnabled: boolean;
}

export const TransactionsTableContainer = ({
  transactions,
  isLoading,
  isError,
  insertEnabled,
}: TransactionsTableProps) => {
  const { data: accounts, isLoading: accountsLoading, isError: accountsError } = useAccounts();

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const { data: vendors, isLoading: vendorsLoading, isError: vendorsError } = useVendors();

  const deleteMutation = useDeleteTransaction();
  const createMutation = useCreateTransaction();
  const createVendorMutation = useCreateVendor();

  const combinedLoading =
    Boolean(isLoading) || accountsLoading || categoriesLoading || vendorsLoading;
  const combinedError = Boolean(isError) || accountsError || categoriesError || vendorsError;

  return (
    <TransactionsTableView
      transactions={transactions}
      isLoading={combinedLoading}
      isError={combinedError}
      insertEnabled={insertEnabled}
      accounts={accounts}
      categories={categories}
      vendors={vendors}
      createTransaction={(payload) => createMutation.mutateAsync(payload)}
      deleteTransaction={(id) => deleteMutation.mutateAsync(id)}
      createVendor={(payload) => createVendorMutation.mutateAsync(payload)}
    />
  );
};
