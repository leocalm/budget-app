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
  isArchived: boolean;
  description: string | null;
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
  description?: string | null;
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
  isArchived: boolean;
  description: string | null;
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
  isArchived: boolean;
  description: string | null;
  actualValue: number;
  shareOfTotalBasisPoints: number;
}

export interface CategoriesDiagnosticResponse {
  periodSummary: PeriodContextSummary;
  budgetedRows: BudgetedCategoryDiagnostic[];
  unbudgetedRows: UnbudgetedCategoryDiagnostic[];
}

// Management view types
export interface CategoryManagementRow extends CategoryResponse {
  globalTransactionCount: number;
  activeChildrenCount: number;
}

export interface CategoriesManagementListResponse {
  incoming: CategoryManagementRow[];
  outgoing: CategoryManagementRow[];
  archived: CategoryManagementRow[];
}
