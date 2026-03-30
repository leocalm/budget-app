import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';

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
  return useQuery({
    queryKey: v2QueryKeys.categories.overview(periodId ?? ''),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/categories/overview', {
        params: { query: { periodId: periodId! } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useCategoriesOptions() {
  return useQuery({
    queryKey: v2QueryKeys.categories.options(),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/categories/options');
      if (error) {
        throw error;
      }
      return data;
    },
  });
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
    },
  });
}

export function useCategoryDetail(id: string, periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.categories.detail(id, periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/categories/{id}/detail', {
        params: { path: { id }, query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: Boolean(id) && Boolean(periodId),
  });
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
    },
  });
}
