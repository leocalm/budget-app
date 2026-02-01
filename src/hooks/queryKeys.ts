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
  spentPerCategory: () => ['spentPerCategory'] as const,
  monthlyBurnIn: () => ['monthlyBurnIn'] as const,
  monthProgress: () => ['monthProgress'] as const,
  budgetPerDay: () => ['budgetPerDay'] as const,
};

export type QueryKey = readonly (string | number | undefined | null)[];
