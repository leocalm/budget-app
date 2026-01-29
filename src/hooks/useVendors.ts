import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVendor, deleteVendor, fetchVendors, updateVendor } from '@/api/vendor';
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

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorRequest }) => updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
