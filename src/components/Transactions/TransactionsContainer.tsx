import React, { useMemo, useState } from 'react';
import { Stack } from '@mantine/core';
import type { TransactionFilterParams } from '@/api/transaction';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import {
  useCreateTransactionFromRequest,
  useDeleteTransaction,
  useInfiniteTransactions,
  useUpdateTransaction,
} from '@/hooks/useTransactions';
import { useVendors } from '@/hooks/useVendors';
import { TransactionsPageView } from './TransactionsPageView';

export function TransactionsContainer() {
  // State for filters
  const [filters, setFilters] = useState<TransactionFilterParams>({ direction: 'all' });

  // Get selected budget period from context
  const { selectedPeriodId } = useBudgetPeriodSelection();

  // Data Fetching
  const {
    data: infiniteData,
    isLoading: txLoading,
    isError: txError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(selectedPeriodId, filters);

  const { data: accounts = [] } = useAccounts(selectedPeriodId);
  const { data: categories = [] } = useCategories(selectedPeriodId);
  const { data: vendors = [] } = useVendors(selectedPeriodId);

  const transactions = useMemo(
    () => infiniteData?.pages.flatMap((p) => p.transactions) ?? undefined,
    [infiniteData]
  );

  // Mutations
  const createMutation = useCreateTransactionFromRequest(selectedPeriodId);
  const updateMutation = useUpdateTransaction(selectedPeriodId);
  const deleteMutation = useDeleteTransaction(selectedPeriodId);

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: 'var(--spacing-2xl)',
      }}
    >
      <Stack gap="md" w="100%">
        <TransactionsPageView
          transactions={transactions}
          isLocked={selectedPeriodId === null}
          isLoading={txLoading}
          isError={txError}
          onRetry={() => void refetch()}
          insertEnabled={selectedPeriodId !== null}
          accounts={accounts}
          categories={categories}
          vendors={vendors}
          filters={filters}
          onFiltersChange={setFilters}
          createTransaction={(payload) => createMutation.mutateAsync(payload)}
          updateTransaction={(id, payload) => updateMutation.mutateAsync({ id, data: payload })}
          deleteTransaction={(id) => deleteMutation.mutateAsync(id)}
          hasNextPage={hasNextPage}
          isFetchingMore={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
        />
      </Stack>
    </div>
  );
}
