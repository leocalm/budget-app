import {
  BudgetPerDay,
  BudgetStability,
  MonthlyBurnIn,
  MonthProgress,
  SpentPerCategory,
  TotalAssets,
} from '@/types/dashboard';
import { TransactionResponse } from '@/types/transaction';
import { apiGet } from './client';

export async function getSpentByCategory(selectedPeriodId: string): Promise<SpentPerCategory[]> {
  return apiGet<SpentPerCategory[]>(
    `/api/dashboard/spent-per-category?period_id=${selectedPeriodId}`
  );
}

export async function getMonthlyBurnIn(selectedPeriodId: string): Promise<MonthlyBurnIn> {
  return apiGet<MonthlyBurnIn>(`/api/dashboard/monthly-burn-in?period_id=${selectedPeriodId}`);
}

export async function getMonthProgress(selectedPeriodId: string): Promise<MonthProgress> {
  return apiGet<MonthProgress>(`/api/dashboard/month-progress?period_id=${selectedPeriodId}`);
}

export async function getRecentTransactions(
  selectedPeriodId: string
): Promise<TransactionResponse[]> {
  return apiGet<TransactionResponse[]>(
    `/api/dashboard/recent-transactions?period_id=${selectedPeriodId}`
  );
}

export async function getBudgetPerDay(selectedPeriodId: string): Promise<BudgetPerDay[]> {
  return apiGet<BudgetPerDay[]>(`/api/dashboard/budget-per-day?period_id=${selectedPeriodId}`);
}

export async function fetchRecentTransactions(
  selectedPeriodId: string
): Promise<TransactionResponse[]> {
  return apiGet<TransactionResponse[]>(
    `/api/dashboard/recent-transactions?period_id=${selectedPeriodId}`
  );
}

export async function fetchTotalAssets(): Promise<TotalAssets> {
  return apiGet<TotalAssets>('/api/dashboard/total-assets');
}

export async function getBudgetStability(): Promise<BudgetStability> {
  return apiGet<BudgetStability>('/api/dashboard/budget-stability');
}
