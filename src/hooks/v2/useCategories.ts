import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { buildCategoryDetail, buildCategoryOverview } from './categoriesAdapter';
import { v2QueryKeys } from './queryKeys';
import { useEncryptedStore } from './useEncryptedStore';

export function useCategories(params: { cursor?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: v2QueryKeys.categories.list(params),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/categories', {
        params: { query: params },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useCategoriesOverview(periodId: string | null) {
  // Retired in Phase 2c — compose locally from the decrypted store.
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    return buildCategoryOverview(store.data);
  }, [store.data]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

export function useCategoriesOptions() {
  // `/categories/options` returns encrypted names/colors/icons. Serve the
  // decrypted form from the store so selectors render plaintext labels.
  const store = useEncryptedStore(null);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    return store.data.categories
      .filter((c) => c.status === 'active')
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        behavior: c.behavior ?? null,
        color: c.color ?? '#868E96',
        icon: c.icon ?? '📂',
      }));
  }, [store.data]);
  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    refetch: store.refetch,
  };
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['CreateCategoryRequest']) => {
      const { data, error } = await apiClient.POST('/categories', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categoryTargets.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['UpdateCategoryRequest'];
    }) => {
      const { data, error } = await apiClient.PUT('/categories/{id}', {
        params: { path: { id } },
        body,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categoryTargets.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE('/categories/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
    },
  });
}

export function useCategoryDetail(id: string, periodId: string) {
  // Retired in Phase 2c — compose the rich detail locally. Cross-period
  // trend is a future enhancement (requires fetching prior periods).
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    return buildCategoryDetail(id, store.data);
  }, [id, store.data]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

export function useArchiveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.POST('/categories/{id}/archive', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
    },
  });
}

export function useUnarchiveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.POST('/categories/{id}/unarchive', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
    },
  });
}
