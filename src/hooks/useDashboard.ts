import { useQuery } from '@tanstack/react-query';
import {
  fetchRecentTransactions,
  getBudgetPerDay,
  getMonthlyBurnIn,
  getMonthProgress,
  getSpentByCategory,
} from '@/api/dashboard';
import { queryKeys } from './queryKeys';

export const useSpentPerCategory = (selectedPeriodId: string) => {
  return useQuery({
    queryKey: queryKeys.spentPerCategory(selectedPeriodId),
    queryFn: () => getSpentByCategory(selectedPeriodId),
  });
};

export const useMonthlyBurnIn = (selectedPeriodId: string) => {
  return useQuery({
    queryKey: queryKeys.monthlyBurnIn(selectedPeriodId),
    queryFn: () => getMonthlyBurnIn(selectedPeriodId),
  });
};

export const useMonthProgress = (selectedPeriodId: string) => {
  return useQuery({
    queryKey: queryKeys.monthProgress(selectedPeriodId),
    queryFn: () => getMonthProgress(selectedPeriodId),
  });
};

export const useBudgetPerDay = (selectedPeriodId: string) => {
  return useQuery({
    queryKey: queryKeys.budgetPerDay(selectedPeriodId),
    queryFn: () => getBudgetPerDay(selectedPeriodId),
  });
};

export const useRecentTransactions = (selectedPeriodId: string) => {
  return useQuery({
    queryKey: queryKeys.recentTransactions(selectedPeriodId),
    queryFn: () => fetchRecentTransactions(selectedPeriodId),
  });
};
