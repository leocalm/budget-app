import { CategoryResponse } from '@/types/category';

export interface BudgetResponse {
  id: string;
  name: string;
  startDay: number;
}

export interface BudgetRequest {
  name: string;
  startDay: number;
}

export interface BudgetCategoryResponse {
  id: string;
  categoryId: string;
  budgetedValue: number;
  category: CategoryResponse;
}

export interface BudgetCategoryRequest {
  categoryId: string;
  budgetedValue: number;
}

export interface BudgetPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface BudgetPeriodRequest {
  name: string;
  startDate: string;
  endDate: string;
}
