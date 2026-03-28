/**
 * Centralized React Query key management for v2 hooks.
 * Single source of truth — never use inline key arrays in v2 hooks.
 */
export const v2QueryKeys = {
  // Accounts
  accounts: {
    all: () => ['accounts'] as const,
    list: (params?: Record<string, unknown>) => ['accounts', params] as const,
    detail: (id: string) => ['accounts', id] as const,
    summary: (periodId: string, params?: Record<string, unknown>) =>
      ['accounts', 'summary', periodId, params] as const,
    options: () => ['accounts', 'options'] as const,
    details: (id: string, periodId: string) => ['accounts', id, 'details', periodId] as const,
    balanceHistory: (id: string, periodId: string) =>
      ['accounts', id, 'balance-history', periodId] as const,
  },

  // Budget Periods
  budgetPeriods: {
    all: () => ['budget-periods'] as const,
    list: (params?: Record<string, unknown>) => ['budget-periods', params] as const,
    detail: (id: string) => ['budget-periods', id] as const,
    schedule: () => ['budget-periods', 'schedule'] as const,
  },

  // Categories
  categories: {
    all: () => ['categories'] as const,
    list: (params?: Record<string, unknown>) => ['categories', params] as const,
    overview: (periodId: string) => ['categories', 'overview', periodId] as const,
    options: () => ['categories', 'options'] as const,
    detail: (id: string, periodId: string) => ['categories', id, 'detail', periodId] as const,
  },

  // Category Targets
  categoryTargets: {
    all: () => ['category-targets'] as const,
    list: (periodId: string) => ['category-targets', periodId] as const,
  },

  // Currencies
  currencies: {
    all: () => ['currencies'] as const,
    byCode: (code: string) => ['currencies', code] as const,
  },

  // Dashboard
  dashboard: {
    all: () => ['dashboard'] as const,
    currentPeriod: (periodId: string) => ['dashboard', 'current-period', periodId] as const,
    netPosition: (periodId: string) => ['dashboard', 'net-position', periodId] as const,
    netPositionHistory: (periodId: string) =>
      ['dashboard', 'net-position-history', periodId] as const,
    currentPeriodHistory: (periodId: string) =>
      ['dashboard', 'current-period-history', periodId] as const,
    cashFlow: (periodId: string) => ['dashboard', 'cash-flow', periodId] as const,
    spendingTrend: (periodId: string) => ['dashboard', 'spending-trend', periodId] as const,
    topVendors: (periodId: string) => ['dashboard', 'top-vendors', periodId] as const,
    budgetStability: (periodId: string) => ['dashboard', 'budget-stability', periodId] as const,
    fixedCategories: (periodId: string) => ['dashboard', 'fixed-categories', periodId] as const,
    subscriptions: (periodId: string) => ['dashboard', 'subscriptions', periodId] as const,
  },

  // Auth
  auth: {
    me: () => ['me'] as const,
  },

  // Onboarding
  onboarding: {
    all: () => ['onboarding'] as const,
    status: () => ['onboarding', 'status'] as const,
  },

  // Overlays
  overlays: {
    all: () => ['overlays'] as const,
    detail: (id: string) => ['overlays', id] as const,
    transactions: (id: string) => ['overlays', id, 'transactions'] as const,
  },

  // Settings
  settings: {
    profile: () => ['settings', 'profile'] as const,
    preferences: () => ['settings', 'preferences'] as const,
    sessions: () => ['settings', 'sessions'] as const,
  },

  // Transactions
  transactions: {
    all: () => ['transactions'] as const,
    list: (filters?: Record<string, unknown>) => ['transactions', filters] as const,
    detail: (id: string) => ['transactions', id] as const,
  },

  // Two-Factor Auth
  twoFactor: {
    all: () => ['two-factor'] as const,
    status: () => ['two-factor', 'status'] as const,
  },

  // Vendors
  vendors: {
    all: () => ['vendors'] as const,
    list: (params?: Record<string, unknown>) => ['vendors', params] as const,
    options: () => ['vendors', 'options'] as const,
    detail: (id: string, periodId: string) => ['vendors', id, 'detail', periodId] as const,
    stats: (periodId: string) => ['vendors', 'stats', periodId] as const,
  },
};
