import {
  BudgetPerDay,
  DashboardData,
  MonthlyBurnIn,
  MonthProgress,
  SpentPerCategory,
} from '@/types/dashboard';
import { TransactionResponse } from '@/types/transaction';
import { apiGet } from './client';

export async function getSpentByCategory(): Promise<SpentPerCategory[]> {
  return apiGet<SpentPerCategory[]>('/api/dashboard/spent-per-category');
}

export async function getMonthlyBurnIn(): Promise<MonthlyBurnIn> {
  return apiGet<MonthlyBurnIn>('/api/dashboard/monthly-burn-in');
}

export async function getMonthProgress(): Promise<MonthProgress> {
  return apiGet<MonthProgress>('/api/dashboard/month-progress');
}

export async function getRecentTransactions(): Promise<TransactionResponse[]> {
  return apiGet<TransactionResponse[]>('/api/dashboard/recent-transactions');
}

export async function getBudgetPerDay(): Promise<BudgetPerDay[]> {
  return apiGet<BudgetPerDay[]>('/api/dashboard/budget-per-day');
}

export async function fetchDashboardData(selectedPeriodId: string | null): Promise<DashboardData> {
  const query = selectedPeriodId ? `?period_id=${selectedPeriodId}` : '';
  return apiGet<DashboardData>(`/api/dashboard/dashboard${query}`);
}
