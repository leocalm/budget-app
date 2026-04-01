import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components, operations } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';

type SubscriptionStatus = NonNullable<
  operations['listSubscriptions']['parameters']['query']
>['status'];

export function useSubscriptions(status?: SubscriptionStatus) {
  return useQuery({
    queryKey: v2QueryKeys.subscriptions.list(status),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/subscriptions', {
        params: { query: status ? { status } : undefined },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: v2QueryKeys.subscriptions.detail(id),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/subscriptions/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useUpcomingCharges(limit?: number) {
  return useQuery({
    queryKey: v2QueryKeys.subscriptions.upcoming(limit),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/subscriptions/upcoming', {
        params: { query: limit !== undefined ? { limit } : undefined },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useSubscriptionsByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: v2QueryKeys.subscriptions.byCategory(categoryId ?? ''),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/subscriptions', {
        params: { query: { categoryId: categoryId! } },
      });
      if (error) {
        throw error;
      }
      return data ?? [];
    },
    enabled: Boolean(categoryId),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['CreateSubscriptionRequest']) => {
      const { data, error } = await apiClient.POST('/subscriptions', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categoryTargets.all() });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['UpdateSubscriptionRequest'];
    }) => {
      const { data, error } = await apiClient.PUT('/subscriptions/{id}', {
        params: { path: { id } },
        body,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categoryTargets.all() });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE('/subscriptions/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categoryTargets.all() });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await apiClient.POST('/subscriptions/{id}/cancel', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categoryTargets.all() });
    },
  });
}
