import {
  BudgetCategoryRequest,
  BudgetCategoryResponse,
  BudgetPeriod,
  BudgetPeriodRequest,
  BudgetRequest,
  BudgetResponse,
} from '@/types/budget';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

export async function fetchBudget(): Promise<BudgetResponse[]> {
  return apiGet<BudgetResponse[]>('/api/budgets');
}

export async function createCategory(payload: BudgetRequest): Promise<BudgetResponse> {
  return apiPost<BudgetResponse, BudgetRequest>('/api/budgets', payload);
}

export async function updateBudget(payload: BudgetResponse): Promise<BudgetResponse> {
  return apiPut<BudgetResponse, BudgetResponse>(`/api/budgets/${payload.id}`, payload);
}

export async function fetchBudgetCategories(): Promise<BudgetCategoryResponse[]> {
  return apiGet<BudgetCategoryResponse[]>('/api/budget-categories');
}

export async function createBudgetCategory(
  payload: BudgetCategoryRequest
): Promise<BudgetCategoryResponse> {
  return apiPost<BudgetCategoryResponse, BudgetCategoryRequest>('/api/budget-categories', payload);
}

export async function deleteBudgetCategory(id: string): Promise<void> {
  return apiDelete(`/api/budget-categories/${id}`);
}

export async function updateBudgetCategory(id: string, payload: number): Promise<void> {
  return apiPut<void, number>(`/api/budget-categories/${id}`, payload);
}

export async function getCurrentBudgetPeriod(): Promise<BudgetPeriod> {
  return apiGet<BudgetPeriod>('/api/budget_period/current');
}

export async function fetchBudgetPeriods(): Promise<BudgetPeriod[]> {
  return apiGet<BudgetPeriod[]>('/api/budget_period');
}

export async function createBudgetPeriod(payload: BudgetPeriodRequest): Promise<string> {
  return apiPost<string, BudgetPeriodRequest>('/api/budget_period', payload);
}
