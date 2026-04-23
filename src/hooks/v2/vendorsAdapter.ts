import type { components } from '@/api/v2';
import type { DecryptedStore } from './useEncryptedStore';

export type LegacyVendorSummary = components['schemas']['VendorSummaryResponse'];
export type LegacyVendorDetail = components['schemas']['VendorDetailResponse'];
export type LegacyVendorStats = components['schemas']['VendorStatsResponse'];
export type LegacyVendorOption = components['schemas']['VendorOptionResponse'];

interface VendorStats {
  numberOfTransactions: number;
  totalSpend: number;
}

function aggregateByVendor(store: DecryptedStore): Map<string, VendorStats> {
  const byId = new Map<string, VendorStats>();
  for (const tx of store.transactions) {
    if (!tx.vendorId) {
      continue;
    }
    const prev = byId.get(tx.vendorId) ?? { numberOfTransactions: 0, totalSpend: 0 };
    prev.numberOfTransactions += 1;
    prev.totalSpend += Math.abs(tx.amount);
    byId.set(tx.vendorId, prev);
  }
  return byId;
}

export function buildVendorSummaries(store: DecryptedStore): LegacyVendorSummary[] {
  const stats = aggregateByVendor(store);
  return store.vendors.map((v) => {
    const s = stats.get(v.id) ?? { numberOfTransactions: 0, totalSpend: 0 };
    return {
      id: v.id,
      name: v.name,
      status: v.status,
      description: v.description,
      numberOfTransactions: s.numberOfTransactions,
      totalSpend: s.totalSpend,
    };
  });
}

export function buildVendorOptions(store: DecryptedStore): LegacyVendorOption[] {
  return store.vendors
    .filter((v) => v.status === 'active')
    .map((v) => ({ id: v.id, name: v.name }));
}

export function buildVendorStats(store: DecryptedStore): LegacyVendorStats {
  const totalVendors = store.vendors.filter((v) => v.status === 'active').length;
  const stats = aggregateByVendor(store);
  let totalSpendThisPeriod = 0;
  for (const v of stats.values()) {
    totalSpendThisPeriod += v.totalSpend;
  }
  const avgSpendPerVendor = totalVendors > 0 ? Math.round(totalSpendThisPeriod / totalVendors) : 0;
  return { totalVendors, totalSpendThisPeriod, avgSpendPerVendor };
}

export function buildVendorDetail(
  vendorId: string,
  store: DecryptedStore
): LegacyVendorDetail | undefined {
  const vendor = store.vendors.find((v) => v.id === vendorId);
  if (!vendor) {
    return undefined;
  }

  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  const vendorTxs = store.transactions.filter((tx) => tx.vendorId === vendorId);
  const transactionCount = vendorTxs.length;
  const periodSpend = vendorTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const averageTransactionAmount =
    transactionCount > 0 ? Math.round(periodSpend / transactionCount) : 0;

  // Top categories by spend at this vendor.
  const byCategory = new Map<string, number>();
  for (const tx of vendorTxs) {
    if (!tx.categoryId) {
      continue;
    }
    byCategory.set(tx.categoryId, (byCategory.get(tx.categoryId) ?? 0) + Math.abs(tx.amount));
  }
  const topCategories = Array.from(byCategory.entries())
    .map(([categoryId, totalSpend]) => {
      const cat = categoriesById.get(categoryId);
      return {
        categoryId,
        categoryName: cat?.name ?? 'Unknown',
        totalSpend,
        percentage: periodSpend > 0 ? (totalSpend / periodSpend) * 100 : 0,
      };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5);

  const recentTransactions = vendorTxs
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 10)
    .map((tx) => ({
      id: tx.id,
      date: tx.date,
      amount: tx.amount,
      description: tx.description,
      categoryId: tx.categoryId ?? null,
      categoryName: tx.categoryId ? (categoriesById.get(tx.categoryId)?.name ?? null) : null,
    }));

  return {
    id: vendor.id,
    name: vendor.name,
    status: vendor.status,
    description: vendor.description,
    periodSpend,
    transactionCount,
    averageTransactionAmount,
    trend: [], // cross-period trend requires historical data we don't fetch yet
    topCategories,
    recentTransactions,
  };
}
