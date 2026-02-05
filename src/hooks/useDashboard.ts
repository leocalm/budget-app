import { useQuery } from '@tanstack/react-query';
import {
  fetchRecentTransactions,
  fetchTotalAssets,
  getBudgetPerDay,
  getMonthlyBurnIn,
  getMonthProgress,
  getSpentByCategory,
} from '@/api/dashboard';
import { queryKeys } from './queryKeys';

export const useSpentPerCategory = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.spentPerCategory(selectedPeriodId),
    queryFn: () => getSpentByCategory(selectedPeriodId!),
    enabled: Boolean(selectedPeriodId),
  });
};

export const useMonthlyBurnIn = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.monthlyBurnIn(selectedPeriodId),
    queryFn: () => getMonthlyBurnIn(selectedPeriodId!),
    enabled: Boolean(selectedPeriodId),
  });
};

export const useMonthProgress = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.monthProgress(selectedPeriodId),
    queryFn: () => getMonthProgress(selectedPeriodId!),
    enabled: Boolean(selectedPeriodId),
  });
};

export const useBudgetPerDay = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.budgetPerDay(selectedPeriodId),
    queryFn: () => getBudgetPerDay(selectedPeriodId!),
    enabled: Boolean(selectedPeriodId),
  });
};

export const useRecentTransactions = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.recentTransactions(selectedPeriodId),
    queryFn: () => fetchRecentTransactions(selectedPeriodId!),
    enabled: Boolean(selectedPeriodId),
  });
};

export const useTotalAssets = () => {
  return useQuery({
    queryKey: queryKeys.totalAssets(),
    queryFn: fetchTotalAssets,
  });
};
