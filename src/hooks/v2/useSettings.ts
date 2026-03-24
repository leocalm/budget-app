import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';

export function useProfile() {
  return useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/settings/profile');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['UpdateProfileRequest']) => {
      const { data, error } = await apiClient.PUT('/settings/profile', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ['settings', 'preferences'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/settings/preferences');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['UpdatePreferencesRequest']) => {
      const { data, error } = await apiClient.PUT('/settings/preferences', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'preferences'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (body: components['schemas']['ChangePasswordRequest']) => {
      const { error } = await apiClient.PUT('/auth/password', { body });
      if (error) {
        throw error;
      }
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ['settings', 'sessions'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/settings/sessions');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE('/settings/sessions/{id}', {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'sessions'] });
    },
  });
}

// Danger zone — destructive and irreversible, always require confirmation UI before calling
export function useResetStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['ResetStructureRequest']) => {
      const { error } = await apiClient.POST('/settings/reset-structure', { body });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useDeleteUserAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['DeleteAccountRequest']) => {
      const { error } = await apiClient.DELETE('/settings/account', { body });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Exports — response is a file download; in the component, convert to Blob and trigger browser download
export function useExportTransactions() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.GET('/settings/export/transactions');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useExportFull() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.GET('/settings/export/data');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}
