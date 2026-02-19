import { CategoryStabilityDot, PeriodContextSummary } from './dashboard';

export const CATEGORY_TYPES = ['Incoming', 'Outgoing', 'Transfer'] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export interface CategoryResponse {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
  categoryType: CategoryType;
}

export interface CategoryStats {
  usedInPeriod: number;
  differenceVsAveragePercentage: number;
  transactionCount: number;
}

export interface CategoryWithStats extends CategoryResponse {
  usedInPeriod: number;
  differenceVsAveragePercentage: number;
  transactionCount: number;
}

export interface CategoryRequest {
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
  categoryType: CategoryType;
}

export interface CategoriesPage {
  categories: CategoryWithStats[];
  nextCursor: string | null;
}

export interface BudgetedCategoryDiagnostic {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
  categoryType: CategoryType;
  budgetedValue: number;
  actualValue: number;
  varianceValue: number;
  progressBasisPoints: number;
  recentClosedPeriods: CategoryStabilityDot[];
}

export interface UnbudgetedCategoryDiagnostic {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
  categoryType: CategoryType;
  actualValue: number;
  shareOfTotalBasisPoints: number;
}

export interface CategoriesDiagnosticResponse {
  periodSummary: PeriodContextSummary;
  budgetedRows: BudgetedCategoryDiagnostic[];
  unbudgetedRows: UnbudgetedCategoryDiagnostic[];
}
