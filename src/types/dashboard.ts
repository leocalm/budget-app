export interface SpentPerCategory {
  categoryName: string;
  budgetedValue: number;
  amountSpent: number;
  percentageSpent: number;
}

export interface MonthlyBurnIn {
  totalBudget: number;
  spentBudget: number;
  currentDay: number;
  daysInPeriod: number;
}

export interface MonthProgress {
  currentDate: string;
  daysInPeriod: number;
  remainingDays: number;
  daysPassedPercentage: number;
}

export interface BudgetPerDay {
  accountName: string;
  date: string;
  balance: number;
}

export interface TotalAssets {
  totalAssets: number;
}

export interface NetPosition {
  totalNetPosition: number;
  changeThisPeriod: number;
  liquidBalance: number;
  protectedBalance: number;
  debtBalance: number;
  accountCount: number;
}

export interface BudgetStabilityPeriod {
  periodId: string;
  isOutsideTolerance: boolean;
}

export interface BudgetStability {
  withinTolerancePercentage: number;
  periodsWithinTolerance: number;
  totalClosedPeriods: number;
  recentClosedPeriods: BudgetStabilityPeriod[];
}
