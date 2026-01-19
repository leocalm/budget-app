import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardData,
  getBudgetPerDay,
  getMonthlyBurnIn,
  getMonthProgress,
  getSpentByCategory,
} from '@/api/dashboard';

export const useSpentPerCategory = () => {
  return useQuery({
    queryKey: ['spentPerCategory'],
    queryFn: getSpentByCategory,
  });
};

export const useMonthlyBurnIn = () => {
  return useQuery({
    queryKey: ['monthlyBurnIn'],
    queryFn: getMonthlyBurnIn,
  });
};

export const useMonthProgress = () => {
  return useQuery({
    queryKey: ['monthProgress'],
    queryFn: getMonthProgress,
  });
};

export const useBudgetPerDay = () => {
  return useQuery({
    queryKey: ['budgetPerDay'],
    queryFn: getBudgetPerDay,
  });
};

export const useDashboardData = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: ['dashboardData', selectedPeriodId],
    queryFn: () => fetchDashboardData(selectedPeriodId),
  });
};
