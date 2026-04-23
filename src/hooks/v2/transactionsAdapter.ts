import type { components } from '@/api/v2';
import type {
  DecryptedAccount,
  DecryptedCategory,
  DecryptedTransaction,
  DecryptedVendor,
} from '@/lib/encryption';
import type { DecryptedStore } from './useEncryptedStore';

export type LegacyTransaction = components['schemas']['TransactionResponse'];
export type LegacyTransactionListResponse = components['schemas']['TransactionListResponse'];

export interface TransactionListFilters {
  // Matches the legacy openapi `Direction` parameter: the category's type.
  direction?: 'income' | 'expense' | 'transfer';
  accountId?: string;
  categoryId?: string;
  vendorId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}

function toAccountRef(account: DecryptedAccount | undefined): components['schemas']['AccountRef'] {
  return {
    id: account?.id ?? '',
    name: account?.name ?? '',
    color: account?.color ?? '#868E96',
  };
}

function toCategoryRef(
  category: DecryptedCategory | undefined
): components['schemas']['CategoryRef'] {
  return {
    id: category?.id ?? '',
    name: category?.name ?? '',
    color: category?.color ?? '#868E96',
    icon: category?.icon ?? '📂',
    type: category?.type ?? 'expense',
  };
}

function toVendorRef(vendor: DecryptedVendor | undefined): components['schemas']['VendorRef'] {
  return { id: vendor?.id ?? '', name: vendor?.name ?? '' };
}

function enrichTransaction(
  tx: DecryptedTransaction,
  accountsById: Map<string, DecryptedAccount>,
  categoriesById: Map<string, DecryptedCategory>,
  vendorsById: Map<string, DecryptedVendor>
): LegacyTransaction {
  const from = accountsById.get(tx.fromAccountId);
  const to = tx.toAccountId ? accountsById.get(tx.toAccountId) : undefined;
  const category = tx.categoryId ? categoriesById.get(tx.categoryId) : undefined;
  const vendor = tx.vendorId ? vendorsById.get(tx.vendorId) : undefined;
  const isTransfer = category?.type === 'transfer';

  const base: components['schemas']['TransactionBase'] = {
    id: tx.id,
    date: tx.date,
    description: tx.description,
    amount: tx.amount,
    transactionType: isTransfer ? 'transfer' : 'regular',
    fromAccount: toAccountRef(from),
    category: toCategoryRef(category),
    vendor: vendor ? toVendorRef(vendor) : null,
  };

  if (isTransfer) {
    return { ...base, toAccount: toAccountRef(to) };
  }
  // openapi-typescript requires `toAccount` on regular to be `null`.
  return { ...base, toAccount: null } as unknown as LegacyTransaction;
}

// iOS Phase 4a fix: the server ignores direction / accountId / categoryId /
// vendorId / fromDate / toDate / search on the encrypted endpoint, so apply
// them client-side after decryption.
function matchesFilters(tx: LegacyTransaction, filters: TransactionListFilters): boolean {
  if (filters.direction && tx.category.type !== filters.direction) {
    return false;
  }
  if (filters.accountId) {
    const matches =
      tx.fromAccount.id === filters.accountId ||
      (tx.transactionType === 'transfer' && tx.toAccount?.id === filters.accountId);
    if (!matches) {
      return false;
    }
  }
  if (filters.categoryId && tx.category.id !== filters.categoryId) {
    return false;
  }
  if (filters.vendorId && tx.vendor?.id !== filters.vendorId) {
    return false;
  }
  if (filters.fromDate && tx.date < filters.fromDate) {
    return false;
  }
  if (filters.toDate && tx.date > filters.toDate) {
    return false;
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const haystack = [tx.description, tx.vendor?.name ?? '', String(Math.abs(tx.amount))]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) {
      return false;
    }
  }
  return true;
}

export interface TransactionListPage {
  data: LegacyTransaction[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export function buildTransactionList(
  store: DecryptedStore,
  filters: TransactionListFilters = {}
): TransactionListPage {
  const accountsById = new Map(store.accounts.map((a) => [a.id, a]));
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  const vendorsById = new Map(store.vendors.map((v) => [v.id, v]));

  const rows: LegacyTransaction[] = store.transactions
    .map((tx) => enrichTransaction(tx, accountsById, categoriesById, vendorsById))
    .filter((tx) => matchesFilters(tx, filters))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const limited =
    typeof filters.limit === 'number' && filters.limit >= 0 ? rows.slice(0, filters.limit) : rows;

  return {
    data: limited,
    totalCount: rows.length,
    hasMore: false,
    nextCursor: null,
  };
}
