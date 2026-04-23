import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { buildAccountDetail, buildAccountSummaries, buildBalanceHistory } from './accountsAdapter';
import { v2QueryKeys } from './queryKeys';
import { useEncryptedStore } from './useEncryptedStore';

// The raw `GET /v2/accounts` list endpoint. Still returns encrypted rows —
// `useEncryptedStore` is what most callers should reach for. This hook is
// kept so mutation `onSuccess` invalidations keep working and so the
// existing openapi-typed code continues to compile.
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

// ─────────────────────────────────────────────────────────────────────
// Legacy-shape adapters
// ─────────────────────────────────────────────────────────────────────
// The UI still consumes the old `AccountSummary`-shaped rows with
// PascalCase `type`, `currentBalance`, `netChangeThisPeriod`, etc. We
// compute them locally from the decrypted store so the page code does not
// need a full rewrite.

export function useAccountsSummary(periodId: string | null) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    const rows = buildAccountSummaries(store.data);
    return {
      data: rows,
      totalCount: rows.length,
      hasMore: false,
      nextCursor: null,
    };
  }, [store.data]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

export function useInfiniteAccountsSummary(periodId: string | null, _pageSize = 50) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    const rows = buildAccountSummaries(store.data);
    return {
      pages: [{ data: rows, totalCount: rows.length, hasMore: false, nextCursor: null }],
      pageParams: [''],
    };
  }, [store.data]);

  return {
    data,
    isLoading: store.isLoading,
    isFetching: store.isFetching,
    isError: store.isError,
    error: store.error,
    hasNextPage: false as const,
    isFetchingNextPage: false as const,
    fetchNextPage: async () => undefined,
    refetch: store.refetch,
  };
}

export function useAccountsOptions() {
  // Derive the option list from the decrypted store — avoids an extra
  // request + decrypt round trip on top of the entities we already fetch.
  const store = useEncryptedStore(null);
  return {
    data: store.data?.accounts.map((a) => ({
      id: a.id,
      accountType: a.accountType,
      name: a.name,
      color: a.color,
    })),
    isLoading: store.isLoading,
    isError: store.isError,
  };
}

export function useAccount(id: string) {
  const store = useEncryptedStore(null);
  const account = store.data?.accounts.find((a) => a.id === id) ?? null;
  return {
    data: account,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

export function useAccountDetails(id: string, periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => {
    if (!store.data) {
      return null;
    }
    return buildAccountDetail(id, store.data);
  }, [id, store.data]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

export function useAccountBalanceHistory(id: string, periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    return buildBalanceHistory(id, store.data);
  }, [id, store.data]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    refetch: store.refetch,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Mutations: still hit the server; the server handles encryption on write.
// ─────────────────────────────────────────────────────────────────────

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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
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
      queryClient.invalidateQueries({ queryKey: ['encryptedStore'] });
    },
  });
}
