import React from 'react';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTransaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { useCreateVendor, useVendors } from '@/hooks/useVendors';
import { TransactionResponse } from '@/types/transaction';
import { TransactionsTableView } from './TransactionsTableView';

export interface TransactionsTableProps {
  transactions: TransactionResponse[] | undefined;
  isLocked: boolean;
  isLoading: boolean | undefined;
  isError: boolean | undefined;
  onRetry: () => void;
  insertEnabled: boolean;
}

export const TransactionsTableContainer = ({
  transactions,
  isLocked,
  isLoading,
  isError,
  onRetry,
  insertEnabled,
}: TransactionsTableProps) => {
  const { selectedPeriodId } = useBudgetPeriodSelection();

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useCategories(selectedPeriodId);

  const {
    data: vendors,
    isLoading: vendorsLoading,
    isError: vendorsError,
    refetch: refetchVendors,
  } = useVendors(selectedPeriodId);

  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsError,
    refetch: refetchAccounts,
  } = useAccounts(selectedPeriodId);

  const deleteMutation = useDeleteTransaction(selectedPeriodId);
  const createMutation = useCreateTransaction(selectedPeriodId);
  const createVendorMutation = useCreateVendor();

  const combinedLoading =
    Boolean(isLoading) || accountsLoading || categoriesLoading || vendorsLoading;
  const combinedError = Boolean(isError) || accountsError || categoriesError || vendorsError;

  return (
    <TransactionsTableView
      transactions={transactions}
      isLocked={isLocked}
      isLoading={combinedLoading}
      isError={combinedError}
      onRetry={() => {
        onRetry();
        void Promise.all([refetchAccounts(), refetchCategories(), refetchVendors()]);
      }}
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
