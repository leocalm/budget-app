export interface CategoryTargetRow {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryType: 'Incoming' | 'Outgoing' | 'Transfer';
  categoryIcon: string;
  categoryColor: string;
  isArchived: boolean;
  isParent: boolean;
  parentCategoryName: string | null;
  currentTarget: number | null;
  previousTarget: number | null;
  isExcluded: boolean;
  exclusionReason: string | null;
  projectedVarianceBasisPoints: number | null;
}

export interface CategoryTargetsResponse {
  periodId: string;
  periodName: string;
  periodStartDate: string;
  periodEndDate: string;
  periodProgressPercent: number;
  totalTargeted: number;
  totalCategories: number;
  targetedCategories: number;
  outgoingTargets: CategoryTargetRow[];
  incomingTargets: CategoryTargetRow[];
  excludedCategories: CategoryTargetRow[];
}

export interface TargetEntry {
  categoryId: string;
  budgetedValue: number;
}

export interface BatchUpsertTargetsRequest {
  targets: TargetEntry[];
}
