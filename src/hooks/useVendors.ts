import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVendor, deleteVendor, fetchVendors, updateVendor } from '@/api/vendor';
import { VendorInput } from '@/types/vendor';
import { queryKeys } from './queryKeys';

export const useVendors = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.vendors(selectedPeriodId),
    queryFn: () => fetchVendors(selectedPeriodId),
    enabled: selectedPeriodId !== null,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorInput) => createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot() });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorInput }) => updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot() });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
};
