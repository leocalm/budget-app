import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components, operations } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';

type VendorListParams = NonNullable<operations['listVendors']['parameters']['query']>;

export function useVendors(params: VendorListParams = {}) {
  return useQuery({
    queryKey: v2QueryKeys.vendors.list(params),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/vendors', {
        params: { query: params },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useVendorsOptions() {
  return useQuery({
    queryKey: v2QueryKeys.vendors.options(),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/vendors/options');
      if (error) {
        throw error;
      }
      return data;
    },
  });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.vendors.all() });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.vendors.all() });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.vendors.all() });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.vendors.all() });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.vendors.all() });
    },
  });
}

export function useVendorDetail(id: string, periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.vendors.detail(id, periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/vendors/{id}/detail', {
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

export function useVendorStats(periodId: string | null) {
  return useQuery({
    queryKey: v2QueryKeys.vendors.stats(periodId ?? ''),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/vendors/stats', {
        params: { query: { periodId: periodId! } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: Boolean(periodId),
  });
}

export function useMergeVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, targetVendorId }: { id: string; targetVendorId: string }) => {
      const { error } = await apiClient.POST('/vendors/{id}/merge', {
        params: { path: { id } },
        body: { targetVendorId },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.vendors.all() });
    },
  });
}
