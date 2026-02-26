import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBudgetPeriod,
  createBudgetPeriodSchedule,
  deleteBudgetPeriod,
  deleteBudgetPeriodSchedule,
  fetchBudget,
  fetchBudgetPeriodGaps,
  fetchBudgetPeriods,
  fetchBudgetPeriodSchedule,
  getCurrentBudgetPeriod,
  updateBudget,
  updateBudgetPeriod,
  updateBudgetPeriodSchedule,
} from '@/api/budget';
import { BudgetPeriodRequest, BudgetPeriodScheduleRequest, BudgetResponse } from '@/types/budget';
import { queryKeys } from './queryKeys';

export const useBudget = () => {
  return useQuery({
    queryKey: queryKeys.budget(),
    queryFn: fetchBudget,
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetResponse) => updateBudget(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
    },
  });
};

export const useCurrentBudgetPeriod = () => {
  return useQuery({
    queryKey: queryKeys.budgetPeriods.current(),
    queryFn: getCurrentBudgetPeriod,
  });
};

export const useBudgetPeriods = () => {
  return useQuery({
    queryKey: queryKeys.budgetPeriods.list(),
    queryFn: fetchBudgetPeriods,
  });
};

export const useCreateBudgetPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetPeriodRequest) => createBudgetPeriod(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.list() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.gaps() });
    },
  });
};

export const useUpdateBudgetPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BudgetPeriodRequest }) =>
      updateBudgetPeriod(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.list() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.current() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.gaps() });
      // Invalidate all period-scoped queries since the period definition changed
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetStability() });
    },
  });
};

export const useDeleteBudgetPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudgetPeriod(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.list() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.current() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.gaps() });
      // Invalidate all period-scoped queries since a period was deleted
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetStability() });
    },
  });
};

export const useBudgetPeriodSchedule = () => {
  return useQuery({
    queryKey: queryKeys.budgetPeriods.schedule(),
    queryFn: fetchBudgetPeriodSchedule,
  });
};

export const useCreateBudgetPeriodSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetPeriodScheduleRequest) => createBudgetPeriodSchedule(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.schedule() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.list() });
    },
  });
};

export const useUpdateBudgetPeriodSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetPeriodScheduleRequest) => updateBudgetPeriodSchedule(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.schedule() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.list() });
    },
  });
};

export const useDeleteBudgetPeriodSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudgetPeriodSchedule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.schedule() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPeriods.list() });
    },
  });
};

export const useBudgetPeriodGaps = () => {
  return useQuery({
    queryKey: queryKeys.budgetPeriods.gaps(),
    queryFn: fetchBudgetPeriodGaps,
  });
};
