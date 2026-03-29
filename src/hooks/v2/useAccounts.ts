import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';

export function useAccounts(params: { cursor?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: v2QueryKeys.accounts.list(params),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/accounts', {
        params: { query: params },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useAccountsSummary(
  periodId: string | null,
  params: { cursor?: string; limit?: number } = {}
) {
  return useQuery({
    queryKey: v2QueryKeys.accounts.summary(periodId ?? '', params),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/accounts/summary', {
        params: { query: { periodId: periodId!, ...params } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useAccountsOptions() {
  return useQuery({
    queryKey: v2QueryKeys.accounts.options(),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/accounts/options');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: v2QueryKeys.accounts.detail(id),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/accounts/{id}', {
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

export function useAccountDetails(id: string, periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.accounts.details(id, periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/accounts/{id}/details', {
        params: { path: { id }, query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!id && !!periodId,
  });
}

export function useAccountBalanceHistory(id: string, periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.accounts.balanceHistory(id, periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/accounts/{id}/balance-history', {
        params: { path: { id }, query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!id && !!periodId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['CreateAccountRequest']) => {
      const { data, error } = await apiClient.POST('/accounts', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.all() });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['UpdateAccountRequest'];
    }) => {
      const { data, error } = await apiClient.PUT('/accounts/{id}', {
        params: { path: { id } },
        body,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.detail(id) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE('/accounts/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
    },
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.POST('/accounts/{id}/archive', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.all() });
    },
  });
}

export function useUnarchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.POST('/accounts/{id}/unarchive', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.all() });
    },
  });
}

export function useAdjustAccountBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['AdjustBalanceRequest'];
    }) => {
      const { data, error } = await apiClient.POST('/accounts/{id}/adjust-balance', {
        params: { path: { id } },
        body,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.accounts.detail(id) });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.dashboard.all() });
    },
  });
}
