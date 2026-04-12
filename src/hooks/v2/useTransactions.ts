import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components, operations } from '@/api/v2';
import { apiClient, v2BaseUrl } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';

type TransactionListParams = operations['listTransactions']['parameters']['query'];
type TransactionListParamsOptionalPeriod = Omit<TransactionListParams, 'periodId'> & {
  periodId?: string;
};

/**
 * Check if the authenticated user has any transactions across all periods.
 * Uses the lightweight `/transactions/has-any` endpoint.
 */
export function useHasAnyTransactions() {
  return useQuery({
    queryKey: [...v2QueryKeys.transactions.all(), 'has-any'],
    queryFn: async () => {
      const baseUrl = v2BaseUrl;
      const response = await fetch(`${baseUrl}/transactions/has-any`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to check transactions: ${response.status}`);
      }
      const data: { hasTransactions: boolean } = await response.json();
      return data.hasTransactions;
    },
    staleTime: 60_000, // Cache for 1 minute
  });
}

export function useTransactions(filters: TransactionListParamsOptionalPeriod) {
  return useQuery({
    queryKey: v2QueryKeys.transactions.list(filters),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/transactions', {
        params: { query: filters as TransactionListParams },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useInfiniteTransactions(
  filters: Omit<TransactionListParams, 'cursor'>,
  pageSize = 30
) {
  return useInfiniteQuery({
    queryKey: [...v2QueryKeys.transactions.list(filters), 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await apiClient.GET('/transactions', {
        params: { query: { ...filters, limit: pageSize, cursor: pageParam || undefined } },
      });
      if (error) {
        throw error;
      }
      return data!;
    },
    initialPageParam: '' as string,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: !!filters.periodId,
  });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.all() });
    },
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
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.transactions.detail(id) });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.all() });
    },
  });
}
