import { useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { buildCategorySummaries } from './categoriesAdapter';
import { v2QueryKeys } from './queryKeys';
import { useEncryptedStore, type DecryptedStore } from './useEncryptedStore';

type PeriodResponse = components['schemas']['PeriodResponse'];

// iOS Phase 4a memo: `/periods` returns 0/NULL for numberOfTransactions,
// totalSpent, totalBudgeted under the encrypted API. Enrich whichever
// period matches the decrypted store's currently-loaded periodId — past
// and upcoming periods show zeroes (parity with iOS; cross-period fetch
// is a follow-up).
function enrichPeriod(period: PeriodResponse, store: DecryptedStore): PeriodResponse {
  const categories = buildCategorySummaries(store);
  let totalSpent = 0;
  let totalBudgeted = 0;
  for (const cat of categories) {
    if (cat.status !== 'active') {
      continue;
    }
    if (cat.type === 'expense') {
      totalSpent += cat.actual;
      if (cat.budgeted != null) {
        totalBudgeted += cat.budgeted;
      }
    }
  }
  return {
    ...period,
    numberOfTransactions: store.transactions.length,
    totalSpent,
    totalBudgeted,
  };
}

export function useBudgetPeriods(params: { cursor?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: v2QueryKeys.budgetPeriods.list(params),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/periods', {
        params: { query: params },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useInfiniteBudgetPeriods(pageSize = 50, enrichPeriodId: string | null = null) {
  const store = useEncryptedStore(enrichPeriodId);
  const raw = useInfiniteQuery({
    queryKey: [...v2QueryKeys.budgetPeriods.list({}), 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await apiClient.GET('/periods', {
        params: { query: { limit: pageSize, cursor: pageParam || undefined } },
      });
      if (error) {
        throw error;
      }
      return data!;
    },
    initialPageParam: '' as string,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });

  const enrichedData = useMemo(() => {
    if (!raw.data || !store.data || !enrichPeriodId) {
      return raw.data;
    }
    return {
      ...raw.data,
      pages: raw.data.pages.map((page) => ({
        ...page,
        data: page.data?.map((p) => (p.id === enrichPeriodId ? enrichPeriod(p, store.data!) : p)),
      })),
    };
  }, [raw.data, store.data, enrichPeriodId]);

  return { ...raw, data: enrichedData };
}

export function useBudgetPeriod(id: string) {
  return useQuery({
    queryKey: v2QueryKeys.budgetPeriods.detail(id),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/periods/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!id,
  });
}

export function useBudgetPeriodSchedule() {
  return useQuery({
    queryKey: v2QueryKeys.budgetPeriods.schedule(),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/periods/schedule');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useCreateBudgetPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['CreatePeriodRequest']) => {
      const { data, error } = await apiClient.POST('/periods', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.budgetPeriods.all() });
    },
  });
}

export function useUpdateBudgetPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['UpdatePeriodRequest'];
    }) => {
      const { data, error } = await apiClient.PUT('/periods/{id}', {
        params: { path: { id } },
        body,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.budgetPeriods.all() });
    },
  });
}

export function useDeleteBudgetPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE('/periods/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.budgetPeriods.all() });
    },
  });
}

export function useCreatePeriodSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['CreatePeriodScheduleRequest']) => {
      const { data, error } = await apiClient.POST('/periods/schedule', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.budgetPeriods.all() });
    },
  });
}

export function useUpdatePeriodSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['UpdatePeriodScheduleRequest']) => {
      const { data, error } = await apiClient.PUT('/periods/schedule', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.budgetPeriods.all() });
    },
  });
}

export function useDeletePeriodSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await apiClient.DELETE('/periods/schedule');
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.budgetPeriods.all() });
    },
  });
}
