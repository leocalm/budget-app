import { useQuery } from '@tanstack/react-query';
import { fetchCurrencies } from '@/api/currency';
import { queryKeys } from './queryKeys';

export const useCurrencies = () => {
  return useQuery({
    queryKey: queryKeys.currencies(),
    queryFn: fetchCurrencies,
  });
};
