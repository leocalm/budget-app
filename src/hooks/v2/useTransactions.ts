import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { components, operations } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';
import { buildTransactionList, type TransactionListFilters } from './transactionsAdapter';
import { useEncryptedStore } from './useEncryptedStore';

type TransactionListParams = operations['listTransactions']['parameters']['query'];
type TransactionListParamsOptionalPeriod = Omit<TransactionListParams, 'periodId'> & {
  periodId?: string;
};

// iOS Phase 4a: `/transactions/has-any` was retired. Fall back to checking
// the currently-loaded period. Callers thread their selected periodId
// through so the store fetches the right slice of transactions; without
// one the store skips the transactions request and the answer is "no
// transactions here" which is fine for the Getting Started gate.
export function useHasAnyTransactions(periodId: string | null = null) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    return store.data.transactions.length > 0;
  }, [store.data]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
  };
}

export function useTransactions(filters: TransactionListParamsOptionalPeriod) {
  const store = useEncryptedStore(filters.periodId ?? null);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    return buildTransactionList(store.data, filters as TransactionListFilters);
  }, [store.data, filters]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

export function useInfiniteTransactions(
  filters: Omit<TransactionListParams, 'cursor'>,
  _pageSize = 30
) {
  const store = useEncryptedStore(filters.periodId ?? null);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    const page = buildTransactionList(store.data, filters as TransactionListFilters);
    return {
      pages: [page],
      pageParams: [''],
    };
  }, [store.data, filters]);

  return {
    data,
    isLoading: store.isLoading,
    isFetching: store.isFetching,
    isError: store.isError,
    error: store.error,
    hasNextPage: false as const,
    isFetchingNextPage: false as const,
    fetchNextPage: async () => undefined,
    refetch: store.refetch,
  };
}

function invalidateTransactionQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: v2QueryKeys.transactions.all() });
  qc.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
  qc.invalidateQueries({ queryKey: v2QueryKeys.accounts.all() });
  qc.invalidateQueries({ queryKey: ['encryptedStore'] });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['CreateTransactionRequest']) => {
      const { data, error } = await apiClient.POST('/transactions', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['UpdateTransactionRequest'];
    }) => {
      const { data, error } = await apiClient.PUT('/transactions/{id}', {
        params: { path: { id } },
        body,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { id }) => {
      invalidateTransactionQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.transactions.detail(id) });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE('/transactions/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => invalidateTransactionQueries(queryClient),
  });
}
