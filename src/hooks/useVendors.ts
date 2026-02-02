import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVendor, deleteVendor, fetchVendors, updateVendor } from '@/api/vendor';
import { VendorRequest } from '@/types/vendor';
import { queryKeys } from './queryKeys';

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
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorRequest }) => updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
};
