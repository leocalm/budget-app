import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, Stack, Text, Title } from '@mantine/core';
import { useAccounts, useDeleteAccount } from '@/hooks/useAccounts';
import { AccountsTableView, AccountStats } from './AccountsTableView';
import { AccountsSummary } from './AccountsSummary';
import { CreateAccount } from './CreateAccount';

export function AccountsContainer() {
  const navigate = useNavigate();
  const { data: accounts, isLoading } = useAccounts();
  const deleteMutation = useDeleteAccount();

  // Calculate Summary Stats
  const summary = useMemo(() => {
    if (!accounts) return { totalAssets: 0, totalLiabilities: 0, netWorth: 0 };

    return accounts.reduce(
      (acc, account) => {
        const balance = account.balance;
        if (balance >= 0) {
          acc.totalAssets += balance;
        } else {
          acc.totalLiabilities += balance; // This will be negative
        }
        acc.netWorth += balance;
        return acc;
      },
      { totalAssets: 0, totalLiabilities: 0, netWorth: 0 }
    );
  }, [accounts]);

  // Mock Stats for individual cards (since we don't have the history endpoint connected yet)
  const accountStats = useMemo(() => {
    if (!accounts) return {};
    const stats: Record<string, AccountStats> = {};
    
    accounts.forEach(acc => {
      stats[acc.id] = {
        balanceHistory: [
            { date: '2024-01-01', balance: acc.balance * 0.9 },
            { date: '2024-01-15', balance: acc.balance * 0.95 },
            { date: '2024-01-30', balance: acc.balance }
        ],
        monthlySpent: 0, // This would come from transaction aggregation
        transactionCount: 0
      };
    });
    return stats;
  }, [accounts]);

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Accounts</Title>
        <Text c="dimmed">Manage your bank accounts and credit cards</Text>
      </div>

      <AccountsSummary
        totalAssets={summary.totalAssets}
        totalLiabilities={summary.totalLiabilities}
        netWorth={summary.netWorth}
      />

      <Group justify="flex-end">
        <CreateAccount onAccountCreated={() => {}} />
      </Group>

      <AccountsTableView
        accounts={accounts}
        isLoading={isLoading}
        onDelete={(id) => deleteMutation.mutate(id)}
        onAccountUpdated={() => {}}
        accountStats={accountStats}
        onViewDetails={(account) => navigate(`/accounts/${account.id}`)}
      />
    </Stack>
  );
}