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
