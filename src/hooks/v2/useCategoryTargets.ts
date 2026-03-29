import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';

export function useCategoryTargets(periodId: string | null) {
  return useQuery({
    queryKey: v2QueryKeys.categoryTargets.list(periodId ?? ''),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/targets', {
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

export function useCreateCategoryTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['CreateTargetRequest']) => {
      const { data, error } = await apiClient.POST('/targets', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categoryTargets.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
    },
  });
}

export function useUpdateCategoryTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['UpdateTargetRequest'];
    }) => {
      const { data, error } = await apiClient.PUT('/targets/{id}', {
        params: { path: { id } },
        body,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categoryTargets.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
    },
  });
}

export function useExcludeCategoryTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.POST('/targets/{id}/exclude', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categoryTargets.all() });
    },
  });
}
