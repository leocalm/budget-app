import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/v2client';

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/currencies');
      if (error) {
        throw error;
      }
      return data;
    },
    staleTime: Infinity, // Currency list is static at runtime — never refetch
  });
}

export function useCurrencyByCode(code: string) {
  return useQuery({
    queryKey: ['currencies', code],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/currencies/{code}', {
        params: { path: { code } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!code,
    staleTime: Infinity,
  });
}
