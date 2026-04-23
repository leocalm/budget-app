import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { components, operations } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import type { DecryptedSubscription } from '@/lib/encryption';
import { v2QueryKeys } from './queryKeys';
import { monthlyBillingAmount, useEncryptedStore } from './useEncryptedStore';

type SubscriptionStatus = NonNullable<
  operations['listSubscriptions']['parameters']['query']
>['status'];

// Encrypted API returns ciphertext for subscription name + billingAmount.
// Serve consumers from the decrypted store instead of hitting the endpoint
// directly. Also applies the iOS Phase 4a fix: the server ignores the
// `status` filter on list, so filter client-side after decryption.
export function useSubscriptions(status?: SubscriptionStatus) {
  const store = useEncryptedStore(null);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    const rows = store.data.subscriptions;
    return status ? rows.filter((s) => s.status === status) : rows;
  }, [store.data, status]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

// Detail view historically included a `billingHistory` array (retired with
// the endpoint). Keep the shape so consumers compile, but leave the field
// empty — populating it requires cross-period transaction data.
export interface SubscriptionBillingEvent {
  id: string;
  subscriptionId: string;
  date: string;
  amount: number;
  paid?: boolean;
  detected?: boolean;
  postCancellation?: boolean;
}

export interface SubscriptionDetailView extends DecryptedSubscription {
  billingHistory: SubscriptionBillingEvent[];
}

export function useSubscription(id: string) {
  const store = useEncryptedStore(null);
  const data = useMemo<SubscriptionDetailView | undefined>(() => {
    const sub = store.data?.subscriptions.find((s) => s.id === id);
    if (!sub) {
      return undefined;
    }
    return { ...sub, billingHistory: [] };
  }, [store.data, id]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

export function useUpcomingCharges(limit?: number) {
  // Retired endpoint — compute from the decrypted store by sorting active
  // subscriptions by `nextChargeDate` ascending.
  const store = useEncryptedStore(null);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    const sorted = store.data.subscriptions
      .filter((s) => s.status === 'active')
      .slice()
      .sort((a, b) => (a.nextChargeDate < b.nextChargeDate ? -1 : 1));
    return limit ? sorted.slice(0, limit) : sorted;
  }, [store.data, limit]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

// iOS Phase 4a fix: `/subscriptions?categoryId=X` filter is ignored by the
// server. Filter client-side after decryption.
export function useSubscriptionsByCategory(categoryId: string | null) {
  const store = useEncryptedStore(null);
  const data = useMemo(() => {
    if (!categoryId || !store.data) {
      return undefined;
    }
    return store.data.subscriptions.filter((s) => s.categoryId === categoryId);
  }, [store.data, categoryId]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

// Helper re-exported for subscription-section UI.
export { monthlyBillingAmount };

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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
    },
  });
}
