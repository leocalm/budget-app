import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';

export function useTwoFactorStatus() {
  return useQuery({
    queryKey: ['two-factor', 'status'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/auth/2fa/status');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useEnableTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.POST('/auth/2fa/enable');
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor'] });
    },
  });
}

export function useVerifyTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['TwoFactorCompleteRequest']) => {
      const { error } = await apiClient.POST('/auth/2fa/verify', { body });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor'] });
    },
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['TwoFactorDisableRequest']) => {
      const { error } = await apiClient.POST('/auth/2fa/disable', { body });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor'] });
    },
  });
}

export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: async (body: components['schemas']['RegenerateBackupCodesRequest']) => {
      const { data, error } = await apiClient.POST('/auth/2fa/backup-codes/regenerate', { body });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useEmergencyDisableRequest() {
  return useMutation({
    mutationFn: async (body: components['schemas']['EmergencyDisableRequestBody']) => {
      const { error } = await apiClient.POST('/auth/2fa/emergency-disable/request', { body });
      if (error) {
        throw error;
      }
    },
  });
}

export function useEmergencyDisableConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['EmergencyDisableConfirmRequest']) => {
      const { error } = await apiClient.POST('/auth/2fa/emergency-disable/confirm', { body });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor'] });
    },
  });
}
