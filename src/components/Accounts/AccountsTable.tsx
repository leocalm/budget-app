import React from 'react';
import { useAccounts, useDeleteAccount } from '@/hooks/useAccounts';
import { AccountsTableView } from './AccountsTableView';

export function AccountsTable() {
  const { data: accounts, isLoading } = useAccounts();
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
