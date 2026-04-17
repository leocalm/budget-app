import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/v2client';
import {
  decryptAccounts,
  decryptCategories,
  decryptSubscriptions,
  decryptTargets,
  decryptTransactions,
  decryptVendors,
  hasDek,
  type DecryptedAccount,
  type DecryptedCategory,
  type DecryptedSubscription,
  type DecryptedTarget,
  type DecryptedTransaction,
  type DecryptedVendor,
  type EncryptedAccount,
  type EncryptedCategory,
  type EncryptedSubscription,
  type EncryptedTarget,
  type EncryptedTransaction,
  type EncryptedVendor,
} from '@/lib/encryption';

// Client-side mirror of the iOS `EncryptedDataStore`. Fetches the six core
// entity lists + period transactions, decrypts everything locally, and caches
// the result under React Query. Consumers call `.data` and get a fully
// decrypted snapshot — no server aggregates involved.

interface RawPaginated<T> {
  data?: T[] | null;
}

export interface DecryptedStore {
  accounts: DecryptedAccount[];
  categories: DecryptedCategory[];
  vendors: DecryptedVendor[];
  subscriptions: DecryptedSubscription[];
  targets: DecryptedTarget[];
  transactions: DecryptedTransaction[];
}

// The allowance-envelope rule documented in the Phase 4a iOS memory:
//   - Transfer TO an allowance account = counts as budget expense
//   - Spending FROM an allowance account = excluded (already allocated)
//   - Anything else: regular expense categories count, everything else doesn't.
export function countsAsBudgetExpense(
  tx: DecryptedTransaction,
  categoriesById: Map<string, DecryptedCategory>,
  accountsById: Map<string, DecryptedAccount>
): boolean {
  const category = tx.categoryId ? categoriesById.get(tx.categoryId) : undefined;
  if (!category) {
    return false;
  }
  const toAccount = tx.toAccountId ? accountsById.get(tx.toAccountId) : undefined;
  const fromAccount = accountsById.get(tx.fromAccountId);
  if (category.type === 'transfer' && toAccount?.accountType === 'allowance') {
    return true;
  }
  if (category.type === 'expense' && fromAccount?.accountType === 'allowance') {
    return false;
  }
  return category.type === 'expense';
}

// Monthly-normalised billing total for subscription-category budgets.
export function monthlyBillingAmount(sub: DecryptedSubscription): number {
  switch (sub.billingCycle) {
    case 'monthly':
      return sub.billingAmount;
    case 'quarterly':
      return Math.round(sub.billingAmount / 3);
    case 'yearly':
      return Math.round(sub.billingAmount / 12);
    default:
      return sub.billingAmount;
  }
}

export function useEncryptedStore(periodId: string | null) {
  return useQuery<DecryptedStore>({
    queryKey: ['encryptedStore', periodId],
    enabled: hasDek() && !!periodId,
    queryFn: async () => {
      if (!periodId) {
        throw new Error('useEncryptedStore requires a periodId');
      }
      const [accountsRes, categoriesRes, vendorsRes, subscriptionsRes, targetsRes, txRes] =
        await Promise.all([
          apiClient.GET('/accounts', { params: { query: {} } }),
          apiClient.GET('/categories', { params: { query: {} } }),
          apiClient.GET('/vendors', { params: { query: {} } }),
          apiClient.GET('/subscriptions', { params: { query: {} } }),
          apiClient.GET('/targets', { params: { query: { periodId } } }),
          apiClient.GET('/transactions', { params: { query: { periodId } } }),
        ]);

      for (const res of [
        accountsRes,
        categoriesRes,
        vendorsRes,
        subscriptionsRes,
        targetsRes,
        txRes,
      ]) {
        if (res.error) {
          throw res.error;
        }
      }

      const accountsRaw =
        (accountsRes.data as unknown as RawPaginated<EncryptedAccount>)?.data ?? [];
      const categoriesRaw =
        (categoriesRes.data as unknown as RawPaginated<EncryptedCategory>)?.data ?? [];
      const vendorsRaw = (vendorsRes.data as unknown as RawPaginated<EncryptedVendor>)?.data ?? [];
      const subscriptionsRaw = (subscriptionsRes.data as unknown as EncryptedSubscription[]) ?? [];
      const targetsRaw = (targetsRes.data as unknown as EncryptedTarget[]) ?? [];
      const transactionsRaw = (txRes.data as unknown as EncryptedTransaction[]) ?? [];

      const [accounts, categories, vendors, subscriptions, targets, transactions] =
        await Promise.all([
          decryptAccounts(accountsRaw),
          decryptCategories(categoriesRaw),
          decryptVendors(vendorsRaw),
          decryptSubscriptions(subscriptionsRaw),
          decryptTargets(targetsRaw),
          decryptTransactions(transactionsRaw),
        ]);

      return { accounts, categories, vendors, subscriptions, targets, transactions };
    },
  });
}

// Convenience selectors that mirror the iOS computed views on `EncryptedDataStore`.
export function totalNetWorth(store: DecryptedStore): number {
  return store.accounts
    .filter((a) => a.status === 'active')
    .reduce((sum, a) => sum + a.currentBalance, 0);
}

export function totalAssets(store: DecryptedStore): number {
  return store.accounts
    .filter((a) => a.status === 'active' && a.accountType !== 'creditcard')
    .reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0);
}

export function totalLiabilities(store: DecryptedStore): number {
  return store.accounts
    .filter((a) => a.status === 'active' && a.accountType === 'creditcard')
    .reduce((sum, a) => sum + Math.abs(Math.min(0, a.currentBalance)), 0);
}

export function totalSpent(store: DecryptedStore): number {
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  const accountsById = new Map(store.accounts.map((a) => [a.id, a]));
  return store.transactions
    .filter((tx) => countsAsBudgetExpense(tx, categoriesById, accountsById))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
}

export function totalIncome(store: DecryptedStore): number {
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  return store.transactions.reduce((sum, tx) => {
    const cat = tx.categoryId ? categoriesById.get(tx.categoryId) : undefined;
    return cat?.type === 'income' ? sum + tx.amount : sum;
  }, 0);
}

export function totalBudgeted(store: DecryptedStore): number {
  return store.targets.filter((t) => !t.isExcluded).reduce((sum, t) => sum + t.budgetedValue, 0);
}

export function monthlySubscriptionTotal(store: DecryptedStore): number {
  return store.subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + monthlyBillingAmount(s), 0);
}
