import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVendor, fetchVendors } from '@/api/vendor';

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
  });
};
