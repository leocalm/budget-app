import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';

export function useBudgetPeriods(params: { cursor?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ['budget-periods', params],
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

export function useBudgetPeriod(id: string) {
  return useQuery({
    queryKey: ['budget-periods', id],
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
    queryKey: ['budget-periods', 'schedule'],
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
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
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
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
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
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
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
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
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
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
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
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
    },
  });
}
