import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/v2client';
import { createWrappedDek, postUnlock, setDekInSession } from '@/lib/encryption';
import { v2QueryKeys } from './queryKeys';

export function useMe() {
  return useQuery({
    queryKey: v2QueryKeys.auth.me(),
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
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.auth.me() });
    },
  });
}

// Wraps the `unlockWithPassword` helper as a mutation so screens can surface
// loading + error state from React Query.
export function useUnlockEncryption() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { unlockWithPassword } = await import('@/lib/encryption');
      await unlockWithPassword(password);
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
    onSuccess: async () => {
      queryClient.clear();
      const { lockSession } = await import('@/lib/encryption');
      lockSession();
    },
  });
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

// Registers a new user under the encrypted API. The client derives a fresh
// 32-byte DEK + Argon2id wrap and uploads the `wrappedDek` + `dekWrapParams`
// alongside the account fields, then posts `/auth/unlock` to establish the
// per-session DEK on the server and caches it in sessionStorage.
export function useRegister() {
  return useMutation({
    mutationFn: async ({ email, password, name }: RegisterInput) => {
      const { dek, wrapped } = await createWrappedDek(password);
      const body = {
        email,
        password,
        name,
        wrappedDek: wrapped.wrappedDekBase64,
        dekWrapParams: wrapped.params,
      } as const;
      // The v2 OpenAPI schema is behind the encryption work — force the
      // generated paths type to accept the wrapped DEK fields.
      const { data, error } = await apiClient.POST('/auth/register', {
        body: body as unknown as Record<string, unknown> as never,
      });
      if (error) {
        throw error;
      }
      await postUnlock(dek);
      setDekInSession(dek);
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
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.auth.me() });
    },
  });
}
