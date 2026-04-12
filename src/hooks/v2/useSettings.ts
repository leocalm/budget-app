import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient, v2BaseUrl } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';

export function useProfile() {
  return useQuery({
    queryKey: v2QueryKeys.settings.profile(),
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
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.settings.profile() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.auth.me() });
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: v2QueryKeys.settings.preferences(),
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
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.settings.preferences() });
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
    queryKey: v2QueryKeys.settings.sessions(),
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
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.settings.sessions() });
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

// Exports — bypass apiClient since responses are CSV/JSON files, not JSON API responses
const exportBaseUrl = v2BaseUrl;

async function downloadExport(path: string, filename: string): Promise<void> {
  const response = await fetch(`${exportBaseUrl}${path}`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }
  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
}

export function useExportTransactions() {
  return useMutation({
    mutationFn: () =>
      downloadExport(
        '/settings/export/transactions',
        `piggy-pulse-transactions-${new Date().toISOString().slice(0, 10)}.csv`
      ),
  });
}

export function useExportFull() {
  return useMutation({
    mutationFn: () =>
      downloadExport(
        '/settings/export/data',
        `piggy-pulse-export-${new Date().toISOString().slice(0, 10)}.json`
      ),
  });
}
