import type { components } from '@/api/v2';
import type { DecryptedCategory, DecryptedSubscription } from '@/lib/encryption';
import {
  countsAsBudgetExpense,
  monthlyBillingAmount,
  type DecryptedStore,
} from './useEncryptedStore';

export type LegacyCategorySummary = components['schemas']['CategorySummaryItem'];
export type LegacyCategoryOverviewSummary = components['schemas']['CategoryOverviewSummary'];
export type LegacyCategoryOverviewResponse = components['schemas']['CategoryOverviewResponse'];

// Auto-budget for subscription-behavior categories = sum of monthly-normalised
// billing amounts across active subscriptions in that category (from the iOS
// Phase 4a fix: "Subscription categories as budgets"). Targets are ignored on
// subscription categories because the amount derives from reality, not intent.
function autoComputedBudgetFor(
  category: DecryptedCategory,
  subscriptions: DecryptedSubscription[]
): number | null {
  if (category.behavior !== 'subscription') {
    return null;
  }
  const total = subscriptions
    .filter((s) => s.categoryId === category.id && s.status === 'active')
    .reduce((sum, s) => sum + monthlyBillingAmount(s), 0);
  return total > 0 ? total : null;
}

function baseRow(category: DecryptedCategory): components['schemas']['CategoryBase'] {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon ?? '📂',
    color: category.color ?? '#868E96',
    type: category.type,
    status: category.status,
    behavior: category.behavior ?? null,
    parentId: category.parentId ?? null,
  };
}

export function buildCategorySummaries(store: DecryptedStore): LegacyCategorySummary[] {
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  const accountsById = new Map(store.accounts.map((a) => [a.id, a]));
  const targetByCategory = new Map(store.targets.map((t) => [t.categoryId, t]));

  // Aggregate spend + income per category.
  const actualByCategory = new Map<string, number>();
  for (const tx of store.transactions) {
    if (!tx.categoryId) {
      continue;
    }
    const category = categoriesById.get(tx.categoryId);
    if (!category) {
      continue;
    }
    const prev = actualByCategory.get(category.id) ?? 0;
    if (category.type === 'income') {
      actualByCategory.set(category.id, prev + tx.amount);
    } else if (countsAsBudgetExpense(tx, categoriesById, accountsById)) {
      actualByCategory.set(category.id, prev + Math.abs(tx.amount));
    }
  }

  return store.categories
    .filter((c) => c.type !== 'transfer')
    .map((category) => {
      const actual = actualByCategory.get(category.id) ?? 0;
      const target = targetByCategory.get(category.id);
      const auto = autoComputedBudgetFor(category, store.subscriptions);
      const budgeted = auto ?? (target && !target.isExcluded ? target.budgetedValue : null);
      return {
        ...baseRow(category),
        actual,
        projected: actual, // no cross-period extrapolation yet
        budgeted,
        variance: budgeted != null ? budgeted - actual : 0,
      };
    });
}

export function buildCategoryOverviewSummary(
  store: DecryptedStore,
  rows: LegacyCategorySummary[]
): LegacyCategoryOverviewSummary {
  let totalSpent = 0;
  let totalBudgeted: number | null = null;
  let totalBudgetedIncoming: number | null = null;

  for (const row of rows) {
    if (row.status !== 'active') {
      continue;
    }
    if (row.type === 'expense') {
      totalSpent += row.actual;
      if (row.budgeted != null) {
        totalBudgeted = (totalBudgeted ?? 0) + row.budgeted;
      }
    } else if (row.type === 'income' && row.budgeted != null) {
      totalBudgetedIncoming = (totalBudgetedIncoming ?? 0) + row.budgeted;
    }
  }
  // store doesn't expose period metadata yet
  void store;

  return {
    periodName: '',
    periodElapsedPercent: 0,
    totalSpent,
    totalBudgeted,
    totalBudgetedIncoming,
    variance: totalBudgeted != null ? totalBudgeted - totalSpent : 0,
  };
}

export function buildCategoryOverview(store: DecryptedStore): LegacyCategoryOverviewResponse {
  const categories = buildCategorySummaries(store);
  const summary = buildCategoryOverviewSummary(store, categories);
  return { summary, categories };
}

// ─────────────────────────────────────────────────────────────────────
// Category detail view
// ─────────────────────────────────────────────────────────────────────

export interface CategoryDetailRecentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  vendorName: string | null;
  accountName: string | null;
}

export interface CategoryDetailView extends LegacyCategorySummary {
  description: string | null;
  periodSpend: number;
  transactionCount: number;
  trend: { periodName: string; totalSpend: number }[];
  recentTransactions: CategoryDetailRecentTransaction[];
}

export function buildCategoryDetail(
  categoryId: string,
  store: DecryptedStore
): CategoryDetailView | undefined {
  const category = store.categories.find((c) => c.id === categoryId);
  if (!category) {
    return undefined;
  }
  const summary = buildCategorySummaries(store).find((r) => r.id === categoryId);
  if (!summary) {
    return undefined;
  }
  const vendorsById = new Map(store.vendors.map((v) => [v.id, v]));
  const accountsById = new Map(store.accounts.map((a) => [a.id, a]));

  const recentTransactions = store.transactions
    .filter((tx) => tx.categoryId === categoryId)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 10)
    .map<CategoryDetailRecentTransaction>((tx) => ({
      id: tx.id,
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      vendorName: tx.vendorId ? (vendorsById.get(tx.vendorId)?.name ?? null) : null,
      accountName: accountsById.get(tx.fromAccountId)?.name ?? null,
    }));

  return {
    ...summary,
    description: category.description ?? null,
    periodSpend: summary.actual,
    transactionCount: store.transactions.filter((tx) => tx.categoryId === categoryId).length,
    trend: [], // cross-period trend requires historical data we don't fetch yet
    recentTransactions,
  };
}
