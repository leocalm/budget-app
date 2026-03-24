import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';

export function useOverlays() {
  return useQuery({
    queryKey: ['overlays'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/overlays');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useOverlay(id: string) {
  return useQuery({
    queryKey: ['overlays', id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/overlays/{id}', {
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

export function useOverlayTransactions(id: string) {
  return useQuery({
    queryKey: ['overlays', id, 'transactions'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/overlays/{id}/transactions', {
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

export function useCreateOverlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['CreateOverlayRequest']) => {
      const { data, error } = await apiClient.POST('/overlays', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overlays'] });
    },
  });
}

export function useUpdateOverlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['UpdateOverlayRequest'];
    }) => {
      const { data, error } = await apiClient.PUT('/overlays/{id}', {
        params: { path: { id } },
        body,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['overlays'] });
      queryClient.invalidateQueries({ queryKey: ['overlays', id] });
    },
  });
}

export function useDeleteOverlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE('/overlays/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overlays'] });
    },
  });
}

export function useIncludeOverlayTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, txId }: { id: string; txId: string }) => {
      const { error } = await apiClient.POST('/overlays/{id}/transactions/{txId}/include', {
        params: { path: { id, txId } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['overlays', id, 'transactions'] });
    },
  });
}

export function useExcludeOverlayTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, txId }: { id: string; txId: string }) => {
      const { error } = await apiClient.DELETE('/overlays/{id}/transactions/{txId}/exclude', {
        params: { path: { id, txId } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['overlays', id, 'transactions'] });
    },
  });
}
