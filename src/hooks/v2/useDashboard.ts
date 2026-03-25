import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/v2client';

export function useDashboardCurrentPeriod(periodId: string) {
  return useQuery({
    queryKey: ['dashboard', 'current-period', periodId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/current-period', {
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

export function useDashboardNetPosition(periodId: string) {
  return useQuery({
    queryKey: ['dashboard', 'net-position', periodId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/net-position', {
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

export function useDashboardNetPositionHistory(periodId: string) {
  return useQuery({
    queryKey: ['dashboard', 'net-position-history', periodId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/net-position-history', {
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

export function useDashboardCurrentPeriodHistory(periodId: string) {
  return useQuery({
    queryKey: ['dashboard', 'current-period-history', periodId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/current-period-history', {
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

export function useDashboardBudgetStability(periodId: string) {
  return useQuery({
    queryKey: ['dashboard', 'budget-stability', periodId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/budget-stability', {
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
