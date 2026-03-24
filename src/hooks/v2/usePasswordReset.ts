import { useMutation } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (body: components['schemas']['ForgotPasswordRequest']) => {
      const { data, error } = await apiClient.POST('/auth/forgot-password', { body });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (body: components['schemas']['ResetPasswordRequest']) => {
      const { data, error } = await apiClient.POST('/auth/reset-password', { body });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}
