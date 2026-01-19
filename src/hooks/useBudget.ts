import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBudgetPeriod,
  fetchBudget,
  fetchBudgetPeriods,
  getCurrentBudgetPeriod,
  updateBudget,
} from '@/api/budget';
import { BudgetPeriodRequest, BudgetResponse } from '@/types/budget';

export const useBudget = () => {
  return useQuery({
    queryKey: ['budget'],
    queryFn: fetchBudget,
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetResponse) => updateBudget(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

export const useCurrentBudgetPeriod = () => {
  return useQuery({
    queryKey: ['budgetPeriods', 'current'],
    queryFn: getCurrentBudgetPeriod,
  });
};

export const useBudgetPeriods = () => {
  return useQuery({
    queryKey: ['budgetPeriods', 'list'],
    queryFn: fetchBudgetPeriods,
  });
};

export const useCreateBudgetPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetPeriodRequest) => createBudgetPeriod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods', 'list'] });
    },
  });
};
