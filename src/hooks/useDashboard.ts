import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchNetPosition,
  fetchRecentTransactions,
  getBudgetPerDay,
  getBudgetStability,
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

export const useNetPosition = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.netPosition(selectedPeriodId),
    queryFn: () => fetchNetPosition(selectedPeriodId!),
    enabled: Boolean(selectedPeriodId),
  });
};

export const useBudgetStability = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.budgetStability(),
    queryFn: getBudgetStability,
    enabled: options?.enabled ?? true,
  });
};

export interface PeriodContextSummary {
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  daysPassedPercentage: number;
  remainingDays: number;
  daysInPeriod: number;
}

export const usePeriodContextSummary = (selectedPeriodId: string | null) => {
  const monthlyBurnInQuery = useMonthlyBurnIn(selectedPeriodId);
  const monthProgressQuery = useMonthProgress(selectedPeriodId);

  const summary = useMemo<PeriodContextSummary>(() => {
    const totalBudget = monthlyBurnInQuery.data?.totalBudget ?? 0;
    const spentBudget = monthlyBurnInQuery.data?.spentBudget ?? 0;

    return {
      totalBudget,
      spentBudget,
      remainingBudget: totalBudget - spentBudget,
      daysPassedPercentage: monthProgressQuery.data?.daysPassedPercentage ?? 0,
      remainingDays: monthProgressQuery.data?.remainingDays ?? 0,
      daysInPeriod: monthProgressQuery.data?.daysInPeriod ?? 0,
    };
  }, [monthProgressQuery.data, monthlyBurnInQuery.data]);

  return {
    summary,
    isLoading:
      selectedPeriodId !== null && (monthlyBurnInQuery.isLoading || monthProgressQuery.isLoading),
    isError: Boolean(monthlyBurnInQuery.error || monthProgressQuery.error),
    refetch: () => Promise.all([monthlyBurnInQuery.refetch(), monthProgressQuery.refetch()]),
  };
};
