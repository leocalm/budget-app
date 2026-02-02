import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardData,
  getBudgetPerDay,
  getMonthlyBurnIn,
  getMonthProgress,
  getSpentByCategory,
} from '@/api/dashboard';
import { queryKeys } from './queryKeys';

export const useSpentPerCategory = () => {
  return useQuery({
    queryKey: queryKeys.spentPerCategory(),
    queryFn: getSpentByCategory,
  });
};

export const useMonthlyBurnIn = () => {
  return useQuery({
    queryKey: queryKeys.monthlyBurnIn(),
    queryFn: getMonthlyBurnIn,
  });
};

export const useMonthProgress = () => {
  return useQuery({
    queryKey: queryKeys.monthProgress(),
    queryFn: getMonthProgress,
  });
};

export const useBudgetPerDay = () => {
  return useQuery({
    queryKey: queryKeys.budgetPerDay(),
    queryFn: getBudgetPerDay,
  });
};

export const useDashboardData = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.dashboardData(selectedPeriodId),
    queryFn: () => fetchDashboardData(selectedPeriodId),
  });
};
