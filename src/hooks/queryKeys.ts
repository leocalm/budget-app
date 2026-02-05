/**
 * Centralized React Query key management
 * Single source of truth for all query keys used across the application
 */

export const queryKeys = {
  // Vendors
  vendors: () => ['vendors'] as const,
  vendor: (id: string) => ['vendor', id] as const,

  // Transactions
  transactions: (periodId?: string | null) => ['transactions', periodId] as const,
  transaction: (id: string) => ['transaction', id] as const,

  // Categories
  categories: () => ['categories'] as const,
  category: (id: string) => ['category', id] as const,
  budgetedCategories: () => ['budgetedCategories'] as const,
  unbudgetedCategories: () => ['unbudgetedCategories'] as const,

  // Accounts
  accounts: () => ['accounts'] as const,
  account: (id: string) => ['account', id] as const,

  // Budget
  budget: () => ['budget'] as const,
  budgets: () => ['budgets'] as const,
  budgetPeriods: {
    list: () => ['budgetPeriods', 'list'] as const,
    current: () => ['budgetPeriods', 'current'] as const,
  },

  // Dashboard
  dashboardData: (periodId?: string | null) => ['dashboardData', periodId] as const,
  spentPerCategory: (periodId?: string | null) => ['spentPerCategory', periodId] as const,
  monthlyBurnIn: (periodId?: string | null) => ['monthlyBurnIn', periodId] as const,
  monthProgress: (periodId?: string | null) => ['monthProgress', periodId] as const,
  budgetPerDay: (periodId?: string | null) => ['budgetPerDay', periodId] as const,
  recentTransactions: (periodId?: string | null) => ['recentTransactions', periodId] as const,
  totalAssets: () => ['totalAssets'] as const,
};

export type QueryKey = readonly (string | number | undefined | null)[];
