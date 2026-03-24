import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';

export function useCategoryTargets(periodId: string) {
  return useQuery({
    queryKey: ['category-targets', periodId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/targets', {
        params: { query: { periodId } },
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
      queryClient.invalidateQueries({ queryKey: ['category-targets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      queryClient.invalidateQueries({ queryKey: ['category-targets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      queryClient.invalidateQueries({ queryKey: ['category-targets'] });
    },
  });
}
