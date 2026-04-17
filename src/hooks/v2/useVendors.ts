import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { components, operations } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';
import { useEncryptedStore } from './useEncryptedStore';
import {
  buildVendorDetail,
  buildVendorOptions,
  buildVendorStats,
  buildVendorSummaries,
  type LegacyVendorDetail,
  type LegacyVendorOption,
  type LegacyVendorStats,
  type LegacyVendorSummary,
} from './vendorsAdapter';

type VendorListParams = NonNullable<operations['listVendors']['parameters']['query']>;

// ─────────────────────────────────────────────────────────────────────
// Reads — all sourced from the decrypted store so names + descriptions
// come back plaintext.
// ─────────────────────────────────────────────────────────────────────

export function useVendors(_params: VendorListParams = {}) {
  const store = useEncryptedStore(null);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    const rows = buildVendorSummaries(store.data);
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

export function useInfiniteVendors(_pageSize = 50) {
  const store = useEncryptedStore(null);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    const rows = buildVendorSummaries(store.data);
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

export function useVendorsOptions() {
  const store = useEncryptedStore(null);
  const data = useMemo<LegacyVendorOption[] | undefined>(() => {
    return store.data ? buildVendorOptions(store.data) : undefined;
  }, [store.data]);
  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    refetch: store.refetch,
  };
}

export function useVendorDetail(id: string, periodId: string) {
  const store = useEncryptedStore(periodId);
  const data = useMemo<LegacyVendorDetail | undefined>(() => {
    return store.data ? buildVendorDetail(id, store.data) : undefined;
  }, [id, store.data]);
  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

export function useVendorStats(periodId: string | null) {
  const store = useEncryptedStore(periodId);
  const data = useMemo<LegacyVendorStats | undefined>(() => {
    return store.data ? buildVendorStats(store.data) : undefined;
  }, [store.data]);
  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    refetch: store.refetch,
  };
}

// Placeholder — /vendors/{id}/summary lookup used to feed the edit drawer.
export function useVendor(id: string) {
  const store = useEncryptedStore(null);
  const data = useMemo<LegacyVendorSummary | undefined>(() => {
    if (!store.data) {
      return undefined;
    }
    return buildVendorSummaries(store.data).find((v) => v.id === id);
  }, [id, store.data]);
  return { data, isLoading: store.isLoading, isError: store.isError };
}

// ─────────────────────────────────────────────────────────────────────
// Mutations — still server-side; invalidate the encryptedStore on success.
// ─────────────────────────────────────────────────────────────────────

function invalidateVendorQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: v2QueryKeys.vendors.all() });
  qc.invalidateQueries({ queryKey: ['encryptedStore'] });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['CreateVendorRequest']) => {
      const { data, error } = await apiClient.POST('/vendors', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => invalidateVendorQueries(queryClient),
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['UpdateVendorRequest'];
    }) => {
      const { data, error } = await apiClient.PUT('/vendors/{id}', {
        params: { path: { id } },
        body,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => invalidateVendorQueries(queryClient),
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE('/vendors/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => invalidateVendorQueries(queryClient),
  });
}

export function useArchiveVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.POST('/vendors/{id}/archive', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => invalidateVendorQueries(queryClient),
  });
}

export function useUnarchiveVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.POST('/vendors/{id}/unarchive', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => invalidateVendorQueries(queryClient),
  });
}

// /vendors/{id}/merge was retired in Phase 2c. Surface a clear error so any
// remaining callers fail loudly instead of silently succeeding.
export function useMergeVendor() {
  return useMutation({
    mutationFn: async (_args: { id: string; targetVendorId: string }): Promise<void> => {
      throw new Error(
        'Vendor merge is not available under the encrypted API; client-side merge is a follow-up.'
      );
    },
  });
}
