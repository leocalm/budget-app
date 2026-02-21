import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  excludeCategoryFromTargets,
  fetchCategoryTargets,
  includeCategoryInTargets,
  saveCategoryTargets,
} from '@/api/categoryTarget';
import { BatchUpsertTargetsRequest } from '@/types/categoryTarget';
import { queryKeys } from './queryKeys';

export const useCategoryTargets = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.categoryTargets(selectedPeriodId),
    queryFn: () => fetchCategoryTargets(selectedPeriodId!),
    enabled: Boolean(selectedPeriodId),
  });
};

export const useSaveCategoryTargets = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BatchUpsertTargetsRequest) => saveCategoryTargets(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryTargets(selectedPeriodId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesDiagnostic() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetedCategories() });
    },
  });
};

export const useExcludeCategory = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: excludeCategoryFromTargets,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryTargets(selectedPeriodId),
      });
    },
  });
};

export const useIncludeCategory = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: includeCategoryInTargets,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryTargets(selectedPeriodId),
      });
    },
  });
};
