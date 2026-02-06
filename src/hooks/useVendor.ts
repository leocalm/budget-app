import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVendor, fetchVendors } from '@/api/vendor';
import { queryKeys } from './queryKeys';

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};

export const useVendors = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.vendors(selectedPeriodId),
    queryFn: () => fetchVendors(selectedPeriodId),
    enabled: selectedPeriodId !== null,
  });
};
