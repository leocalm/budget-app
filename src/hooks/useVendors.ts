// hooks/useVendors.ts
// hooks/useVendors.ts
// hooks/useVendors.ts
// hooks/useVendors.ts
// hooks/useVendors.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVendor, fetchVendors } from '@/api/vendor';
import { VendorRequest } from '@/types/vendor';

export const queryKeys = {
  vendors: () => ['vendors'] as const,
  vendor: (id: string) => ['vendor', id] as const,
};

export const useVendors = () => {
  return useQuery({
    queryKey: queryKeys.vendors(),
    queryFn: () => fetchVendors(),
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorRequest) => createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};
