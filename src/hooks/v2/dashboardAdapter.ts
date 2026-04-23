import type { components } from '@/api/v2';
import { buildCategorySummaries } from './categoriesAdapter';
import {
  countsAsBudgetExpense,
  monthlyBillingAmount,
  type DecryptedStore,
} from './useEncryptedStore';

type PeriodResponse = components['schemas']['PeriodResponse'];
export type LegacyCurrentPeriod = components['schemas']['CurrentPeriod'];
export type LegacyCashFlow = components['schemas']['CashFlowResponse'];
export type LegacySpendingTrend = components['schemas']['SpendingTrendResponse'];
export type LegacyTopVendors = components['schemas']['TopVendorsResponse'];
export type LegacyFixedCategories = components['schemas']['FixedCategoriesResponse'];
export type LegacySubscriptionsDashboard = components['schemas']['SubscriptionsDashboardResponse'];
export type LegacyBudgetStability = components['schemas']['BudgetStability'];
export type LegacyNetPositionHistory = components['schemas']['NetPositionHistoryResponse'];
export type LegacyCurrentPeriodHistory = components['schemas']['CurrentPeriodHistoryResponse'];

// Period length / remaining days live on the period object, not the store.
// The caller threads it through when available; otherwise we degrade to
// zero day counts so the UI doesn't render NaN.
function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));
}

function periodEndDate(period: PeriodResponse | null | undefined): Date | null {
  if (!period) {
    return null;
  }
  if (period.periodType === 'manualEndDate') {
    const me = (period as unknown as { manualEndDate?: string }).manualEndDate;
    if (me) {
      return new Date(me);
    }
  }
  // duration-based: start + length days
  return new Date(new Date(period.startDate).getTime() + period.length * 86400000);
}

export function buildCurrentPeriod(
  store: DecryptedStore,
  period: PeriodResponse | null | undefined
): LegacyCurrentPeriod {
  // `spent` uses the raw iOS rule: sum of transactions that count as
  // budget expense (allowance rule applied). Going through the category
  // summaries would miss transfer-to-allowance amounts, which are
  // indexed under the transfer-type category and get filtered out there.
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  const accountsById = new Map(store.accounts.map((a) => [a.id, a]));
  let spent = 0;
  for (const tx of store.transactions) {
    if (countsAsBudgetExpense(tx, categoriesById, accountsById)) {
      spent += Math.abs(tx.amount);
    }
  }

  // Target = sum of budgeted amounts (manual targets + subscription-auto
  // budgets) for active expense categories. Income target = same for
  // income categories.
  const categories = buildCategorySummaries(store);
  let target = 0;
  let incomeTarget = 0;
  for (const cat of categories) {
    if (cat.status !== 'active') {
      continue;
    }
    if (cat.type === 'expense' && cat.budgeted != null) {
      target += cat.budgeted;
    } else if (cat.type === 'income' && cat.budgeted != null) {
      incomeTarget += cat.budgeted;
    }
  }

  const start = period ? new Date(period.startDate) : null;
  const end = periodEndDate(period);
  const now = new Date();
  const daysInPeriod = start && end ? daysBetween(end, start) : (period?.length ?? 0);
  const daysRemaining = end ? daysBetween(end, now) : (period?.remainingDays ?? 0);
  const daysElapsed = Math.max(1, daysInPeriod - daysRemaining);
  const projectedSpend =
    daysInPeriod > 0 ? Math.round((spent / daysElapsed) * daysInPeriod) : spent;

  return { spent, target, incomeTarget, daysRemaining, daysInPeriod, projectedSpend };
}

export function buildCashFlow(store: DecryptedStore): LegacyCashFlow {
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  const accountsById = new Map(store.accounts.map((a) => [a.id, a]));
  let inflows = 0;
  let outflows = 0;
  for (const tx of store.transactions) {
    const cat = tx.categoryId ? categoriesById.get(tx.categoryId) : undefined;
    if (cat?.type === 'income') {
      inflows += tx.amount;
    } else if (countsAsBudgetExpense(tx, categoriesById, accountsById)) {
      outflows += Math.abs(tx.amount);
    }
  }
  return { inflows, outflows, net: inflows - outflows };
}

// Cross-period data is not fetched by the current store, so the trend
// array comes back empty. Matches iOS Phase 4a: "Spending trend widget —
// remains nil/empty (requires cross-period historical data)."
export function buildSpendingTrend(_store: DecryptedStore): LegacySpendingTrend {
  return { periods: [], periodAverage: 0 };
}

export function buildTopVendors(store: DecryptedStore, limit = 5): LegacyTopVendors {
  const byVendor = new Map<string, { totalSpent: number; transactionCount: number }>();
  for (const tx of store.transactions) {
    if (!tx.vendorId) {
      continue;
    }
    const prev = byVendor.get(tx.vendorId) ?? { totalSpent: 0, transactionCount: 0 };
    prev.totalSpent += Math.abs(tx.amount);
    prev.transactionCount += 1;
    byVendor.set(tx.vendorId, prev);
  }
  const vendorsById = new Map(store.vendors.map((v) => [v.id, v]));
  return Array.from(byVendor.entries())
    .map(([vendorId, stats]) => ({
      vendorId,
      vendorName: vendorsById.get(vendorId)?.name ?? 'Unknown',
      totalSpent: stats.totalSpent,
      transactionCount: stats.transactionCount,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

export function buildFixedCategories(store: DecryptedStore): LegacyFixedCategories {
  const rows = buildCategorySummaries(store).filter(
    (c) => c.status === 'active' && c.type === 'expense' && c.behavior === 'fixed'
  );
  let totalBudgeted = 0;
  let totalPaid = 0;
  const categories = rows.map((c) => {
    const budgeted = c.budgeted ?? 0;
    const paid = c.actual;
    totalBudgeted += budgeted;
    totalPaid += paid;
    let status: 'paid' | 'partial' | 'pending' = 'pending';
    if (budgeted > 0 && paid >= budgeted) {
      status = 'paid';
    } else if (paid > 0) {
      status = 'partial';
    }
    return { id: c.id, name: c.name, budgeted, paid, status };
  });
  return { totalBudgeted, totalPaid, categories };
}

export function buildSubscriptionsDashboard(store: DecryptedStore): LegacySubscriptionsDashboard {
  const active = store.subscriptions.filter((s) => s.status === 'active');
  const today = new Date().toISOString().slice(0, 10);
  const items = active.map((s) => {
    let displayStatus: 'charged' | 'today' | 'upcoming' = 'upcoming';
    if (s.nextChargeDate < today) {
      displayStatus = 'charged';
    } else if (s.nextChargeDate === today) {
      displayStatus = 'today';
    }
    return {
      id: s.id,
      name: s.name,
      billingAmount: s.billingAmount,
      billingCycle: s.billingCycle,
      nextChargeDate: s.nextChargeDate,
      displayStatus,
    };
  });
  const monthlyTotal = active.reduce((sum, s) => sum + monthlyBillingAmount(s), 0);
  const yearlyTotal = active.reduce((sum, s) => {
    switch (s.billingCycle) {
      case 'yearly':
        return sum + s.billingAmount;
      case 'quarterly':
        return sum + s.billingAmount * 4;
      case 'monthly':
      default:
        return sum + s.billingAmount * 12;
    }
  }, 0);
  return {
    activeCount: active.length,
    monthlyTotal,
    yearlyTotal,
    subscriptions: items,
  };
}

// Cross-period data — returned empty per iOS Phase 4a parity. Widgets that
// depend on this degrade to a neutral state.
export function buildBudgetStability(_store: DecryptedStore): LegacyBudgetStability {
  return { stability: 0, periodsWithinRange: 0, periodsStability: [] };
}
export function buildNetPositionHistory(_store: DecryptedStore): LegacyNetPositionHistory {
  return [];
}

// Daily cumulative-spend history for the currently-selected period.
// Groups each day's transactions that count as budget expense and
// accumulates running totals.
export function buildCurrentPeriodHistory(store: DecryptedStore): LegacyCurrentPeriodHistory {
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  const accountsById = new Map(store.accounts.map((a) => [a.id, a]));
  const dailyTotals = new Map<string, number>();
  for (const tx of store.transactions) {
    if (!countsAsBudgetExpense(tx, categoriesById, accountsById)) {
      continue;
    }
    dailyTotals.set(tx.date, (dailyTotals.get(tx.date) ?? 0) + Math.abs(tx.amount));
  }
  const dates = Array.from(dailyTotals.keys()).sort();
  let cumulativeSpent = 0;
  return dates.map((date) => {
    const dailySpent = dailyTotals.get(date) ?? 0;
    cumulativeSpent += dailySpent;
    return { date, cumulativeSpent, dailySpent };
  });
}
