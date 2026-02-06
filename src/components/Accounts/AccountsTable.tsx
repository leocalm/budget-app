import React from 'react';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts, useDeleteAccount } from '@/hooks/useAccounts';
import { AccountsTableView } from './AccountsTableView';

export function AccountsTable() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: accounts, isLoading } = useAccounts(selectedPeriodId);
  const deleteMutation = useDeleteAccount();

  return (
    <AccountsTableView
      accounts={accounts}
      isLoading={isLoading}
      onDelete={(id) => deleteMutation.mutate(id)}
      onAccountUpdated={() => {}}
    />
  );
}
