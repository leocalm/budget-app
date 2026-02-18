import React from 'react';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts, useDeleteAccount } from '@/hooks/useAccounts';
import { AccountsTableView } from './AccountsTableView';

export function AccountsTable() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: accounts, isLoading, isError, refetch } = useAccounts(selectedPeriodId);
  const deleteMutation = useDeleteAccount();

  return (
    <AccountsTableView
      accounts={accounts}
      isLocked={selectedPeriodId === null}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => {
        void refetch();
      }}
      onDelete={(id) => deleteMutation.mutate(id)}
      onAccountUpdated={() => {}}
    />
  );
}
