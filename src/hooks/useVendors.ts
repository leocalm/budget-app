import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVendor,
  deleteVendor,
  fetchVendors,
  fetchVendorsPage,
  updateVendor,
} from '@/api/vendor';
import { VendorInput } from '@/types/vendor';
import { queryKeys } from './queryKeys';

const VENDORS_PAGE_SIZE = 50;

export const useVendors = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.vendors(selectedPeriodId),
    queryFn: () => fetchVendors(selectedPeriodId),
    enabled: selectedPeriodId !== null,
  });
};

export const useInfiniteVendors = (selectedPeriodId: string | null) => {
  return useInfiniteQuery({
    queryKey: queryKeys.vendorsInfinite(selectedPeriodId, VENDORS_PAGE_SIZE),
    queryFn: ({ pageParam }) =>
      fetchVendorsPage({
        periodId: selectedPeriodId,
        cursor: pageParam,
        pageSize: VENDORS_PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: selectedPeriodId !== null,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorInput) => createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsInfinite() });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorInput }) => updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsInfinite() });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsInfinite() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
};
