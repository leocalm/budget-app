import {
  BudgetCategoryRequest,
  BudgetCategoryResponse,
  BudgetCategoryUpdateRequest,
  BudgetPeriod,
  BudgetPeriodGaps,
  BudgetPeriodRequest,
  BudgetPeriodSchedule,
  BudgetPeriodScheduleRequest,
  BudgetRequest,
  BudgetResponse,
} from '@/types/budget';
import { apiDelete, apiGet, apiPost, apiPut } from './client';
import { ApiError } from './errors';

export async function fetchBudget(): Promise<BudgetResponse[]> {
  return apiGet<BudgetResponse[]>('/api/budgets');
}

export async function createBudget(payload: BudgetRequest): Promise<BudgetResponse> {
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

export async function updateBudgetCategory(
  id: string,
  payload: BudgetCategoryUpdateRequest
): Promise<void> {
  return apiPut<void, BudgetCategoryUpdateRequest>(`/api/budget-categories/${id}`, payload);
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

export async function updateBudgetPeriod(
  id: string,
  payload: BudgetPeriodRequest
): Promise<BudgetPeriod> {
  return apiPut<BudgetPeriod, BudgetPeriodRequest>(`/api/budget_period/${id}`, payload);
}

export async function deleteBudgetPeriod(id: string): Promise<void> {
  return apiDelete(`/api/budget_period/${id}`);
}

export async function fetchBudgetPeriodSchedule(): Promise<BudgetPeriodSchedule | null> {
  try {
    return await apiGet<BudgetPeriodSchedule>('/api/budget_period/schedule');
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) {
      return null;
    }

    throw error;
  }
}

export async function createBudgetPeriodSchedule(
  payload: BudgetPeriodScheduleRequest
): Promise<BudgetPeriodSchedule> {
  return apiPost<BudgetPeriodSchedule, BudgetPeriodScheduleRequest>(
    '/api/budget_period/schedule',
    payload
  );
}

export async function updateBudgetPeriodSchedule(
  payload: BudgetPeriodScheduleRequest
): Promise<BudgetPeriodSchedule> {
  return apiPut<BudgetPeriodSchedule, BudgetPeriodScheduleRequest>(
    '/api/budget_period/schedule',
    payload
  );
}

export async function deleteBudgetPeriodSchedule(): Promise<void> {
  return apiDelete('/api/budget_period/schedule');
}

export async function fetchBudgetPeriodGaps(): Promise<BudgetPeriodGaps> {
  try {
    return await apiGet<BudgetPeriodGaps>('/api/budget_period/gaps');
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) {
      return { unassignedCount: 0, transactions: [] };
    }

    throw error;
  }
}
