import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteTransaction, useTransactions } from '@/hooks/useTransactions';
import { convertCentsToDisplay } from '@/utils/currency';
import { getIcon } from '@/utils/IconMap';

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteTransactionMutation = useDeleteTransaction(null);

  const { selectedPeriodId } = useBudgetPeriodSelection();

  const { data: categories, isLoading: isLoadingCategories } = useCategories(selectedPeriodId);
  const { data: transactions } = useTransactions(null);

  const category = useMemo(() => categories?.find((c) => c.id === id), [categories, id]);

  // Filter transactions for this category
  const categoryTransactions = useMemo(() => {
    if (!transactions || !id) {
      return [];
    }
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
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {categoryTransactions.map((tx) => (
                <Table.Tr key={tx.id}>
                  <Table.Td>{tx.occurredAt}</Table.Td>
                  <Table.Td>{tx.description}</Table.Td>
                  <Table.Td>
                    <Badge size="sm">{convertCentsToDisplay(tx.amount)}</Badge>
                  </Table.Td>
                  <Table.Td ta="right">
                    <ActionIcon
                      color="red"
                      size="sm"
                      variant="subtle"
                      onClick={() => void deleteTransactionMutation.mutateAsync(tx.id)}
                      aria-label="Delete"
                    >
                      🗑️
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No transactions found for this category.
          </Text>
        )}
      </Paper>
    </Stack>
  );
}
