import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/auth/me');
      if (error) {
        throw error;
      }
      return data;
    },
    retry: false, // A 401 means logged out — don't retry
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const { data, error } = await apiClient.POST('/auth/login', { body });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await apiClient.POST('/auth/logout');
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.clear(); // Wipe all cached data on logout
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (body: components['schemas']['RegisterRequest']) => {
      const { data, error } = await apiClient.POST('/auth/register', { body });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.POST('/auth/refresh');
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
