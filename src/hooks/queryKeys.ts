/**
 * Centralized React Query key management
 * Single source of truth for all query keys used across the application
 */

export const queryKeys = {
  // Vendors
  vendorsRoot: () => ['vendors'] as const,
  vendors: (periodId?: string | null) => ['vendors', periodId] as const,
  vendorsInfinite: (periodId?: string | null, pageSize = 50) =>
    ['vendors', periodId, 'infinite', pageSize] as const,
  vendor: (id: string) => ['vendor', id] as const,

  // Transactions
  transactions: (periodId?: string | null) => ['transactions', periodId] as const,
  transactionsInfinite: (periodId?: string | null, pageSize = 50) =>
    ['transactions', periodId, 'infinite', pageSize] as const,
  transaction: (id: string) => ['transaction', id] as const,

  // Categories
  categories: (periodId?: string | null) => ['categories', periodId] as const,
  categoriesInfinite: (periodId?: string | null, pageSize = 50) =>
    ['categories', periodId, 'infinite', pageSize] as const,
  category: (id: string) => ['category', id] as const,
  budgetedCategories: () => ['budgetedCategories'] as const,
  unbudgetedCategories: () => ['unbudgetedCategories'] as const,

  // Accounts
  accounts: (periodId?: string | null) =>
    periodId === undefined ? (['accounts'] as const) : (['accounts', periodId] as const),
  accountsInfinite: (periodId?: string | null, pageSize = 50) =>
    ['accounts', periodId, 'infinite', pageSize] as const,
  account: (id: string) => ['account', id] as const,

  // Budget
  budget: () => ['budget'] as const,
  budgets: () => ['budgets'] as const,
  budgetPeriods: {
    list: () => ['budgetPeriods', 'list'] as const,
    current: () => ['budgetPeriods', 'current'] as const,
    schedule: () => ['budgetPeriods', 'schedule'] as const,
    gaps: () => ['budgetPeriods', 'gaps'] as const,
  },

  // Overlays
  overlays: {
    list: () => ['overlays', 'list'] as const,
    detail: (id: string) => ['overlays', 'detail', id] as const,
  },

  // Settings
  settings: () => ['settings'] as const,

  // Currencies
  currencies: () => ['currencies'] as const,

  // Dashboard
  dashboardData: (periodId?: string | null) => ['dashboardData', periodId] as const,
  spentPerCategory: (periodId?: string | null) => ['spentPerCategory', periodId] as const,
  monthlyBurnIn: (periodId?: string | null) => ['monthlyBurnIn', periodId] as const,
  monthProgress: (periodId?: string | null) => ['monthProgress', periodId] as const,
  budgetPerDay: (periodId?: string | null) => ['budgetPerDay', periodId] as const,
  recentTransactions: (periodId?: string | null) => ['recentTransactions', periodId] as const,
  totalAssets: () => ['totalAssets'] as const,
  netPosition: (periodId?: string | null) => ['netPosition', periodId] as const,
  budgetStability: () => ['budgetStability'] as const,
};

export type QueryKey = readonly (string | number | undefined | null)[];
