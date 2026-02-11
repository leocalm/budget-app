import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionIcon, Button, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { fetchAccount } from '@/api/account';
import { TransactionList } from '@/components/Transactions';
import { queryKeys } from '@/hooks/queryKeys';
import { useDeleteTransaction, useTransactions } from '@/hooks/useTransactions';
import { AccountCard } from './AccountCard';

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteTransactionMutation = useDeleteTransaction(null);

  const { data: account, isLoading: isLoadingAccount } = useQuery({
    queryKey: queryKeys.account(id!),
    queryFn: () => fetchAccount(id!),
    enabled: !!id,
  });

  const { data: transactions } = useTransactions(null);

  // Filter transactions for this account
  const accountTransactions = useMemo(() => {
    if (!transactions || !id) {
      return [];
    }
    return transactions.filter((t) => t.fromAccount.id === id || t.toAccount?.id === id);
  }, [transactions, id]);

  if (isLoadingAccount) {
    return <Loader />;
  }

  if (!account) {
    return <Text>Account not found</Text>;
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <ActionIcon variant="subtle" onClick={() => navigate('/accounts')}>
            <span>⬅️</span>
          </ActionIcon>
          <Title order={2}>{account.name}</Title>
        </Group>
        <Button variant="light" leftSection={<span>✏️</span>}>
          Edit Account
        </Button>
      </Group>

      <AccountCard
        account={account}
        balanceHistory={[]} // Placeholder for history data
        monthlySpent={0} // Placeholder
        transactionCount={accountTransactions.length}
        onEdit={() => {}}
        onDelete={() => {}}
        onViewDetails={() => {}}
      />

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="md">
          Transaction History
        </Title>
        {accountTransactions.length > 0 ? (
          <TransactionList
            transactions={accountTransactions}
            deleteTransaction={(txId) => deleteTransactionMutation.mutateAsync(txId)}
          />
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No transactions found for this account.
          </Text>
        )}
      </Paper>
    </Stack>
  );
}
