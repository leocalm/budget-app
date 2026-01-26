import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionIcon, Group, Loader, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { TransactionList } from '@/components/Transactions';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteTransaction, useTransactions } from '@/hooks/useTransactions';
import { getIcon } from '@/utils/IconMap';

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteTransactionMutation = useDeleteTransaction();

  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: transactions } = useTransactions(null);

  const category = useMemo(() => categories?.find((c) => c.id === id), [categories, id]);

  // Filter transactions for this category
  const categoryTransactions = useMemo(() => {
    if (!transactions || !id) return [];
    return transactions.filter((t) => t.category.id === id);
  }, [transactions, id]);

  if (isLoadingCategories) {
    return <Loader />;
  }

  if (!category) {
    return <Text>Category not found</Text>;
  }

  return (
    <Stack gap="lg">
      <Group>
        <ActionIcon variant="subtle" onClick={() => navigate('/categories')}>
          <span>⬅️</span>
        </ActionIcon>
        <Group gap="sm">
          <ThemeIcon variant="light" color={category.color || 'gray'} size="lg" radius="md">
            {getIcon(category.icon, 20)}
          </ThemeIcon>
          <div>
            <Title order={2}>{category.name}</Title>
            <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
              {category.categoryType}
            </Text>
          </div>
        </Group>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Transaction History</Title>
          <Text c="dimmed" size="sm">
            {categoryTransactions.length} transactions
          </Text>
        </Group>

        {categoryTransactions.length > 0 ? (
          <TransactionList
            transactions={categoryTransactions}
            deleteTransaction={(txId) => deleteTransactionMutation.mutateAsync(txId)}
          />
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No transactions found for this category.
          </Text>
        )}
      </Paper>
    </Stack>
  );
}
