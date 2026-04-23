import type { components } from '@/api/v2';
import type { DecryptedAccount, DecryptedTransaction } from '@/lib/encryption';
import { countsAsBudgetExpense, type DecryptedStore } from './useEncryptedStore';

// The legacy v2 OpenAPI types describe account type as PascalCase
// (`Checking`, `CreditCard`, …) while the encrypted API returns lowercase
// (`checking`, `creditcard`, …). Every renderer still switches on the
// PascalCase variants, so the adapter mirrors the old DTO exactly.
export type LegacyAccountType = 'Checking' | 'Savings' | 'CreditCard' | 'Allowance' | 'Wallet';

const PASCAL_FOR: Record<DecryptedAccount['accountType'], LegacyAccountType> = {
  checking: 'Checking',
  savings: 'Savings',
  creditcard: 'CreditCard',
  wallet: 'Wallet',
  allowance: 'Allowance',
};

export type LegacyAccountSummary = components['schemas']['AccountSummaryResponse'];
export type LegacyAccountSummaryListResponse = components['schemas']['AccountSummaryListResponse'];

interface PeriodTxStats {
  count: number;
  netChange: number;
}

function aggregateTransactions(transactions: DecryptedTransaction[]): Map<string, PeriodTxStats> {
  const stats = new Map<string, PeriodTxStats>();
  const bump = (id: string, delta: number) => {
    const prev = stats.get(id) ?? { count: 0, netChange: 0 };
    prev.count += 1;
    prev.netChange += delta;
    stats.set(id, prev);
  };
  for (const tx of transactions) {
    // Outflow on the `from` side, inflow on the `to` side of a transfer.
    bump(tx.fromAccountId, -Math.abs(tx.amount));
    if (tx.toAccountId) {
      bump(tx.toAccountId, Math.abs(tx.amount));
    }
  }
  return stats;
}

// Builds a legacy AccountSummary from the decrypted store. Mirrors the
// fields the Rocket handler used to emit before Phase 2c retired it.
export function buildAccountSummary(
  account: DecryptedAccount,
  stats: Map<string, PeriodTxStats>
): LegacyAccountSummary {
  const s = stats.get(account.id) ?? { count: 0, netChange: 0 };
  return {
    id: account.id,
    name: account.name,
    color: account.color,
    type: PASCAL_FOR[account.accountType],
    status: account.status,
    currentBalance: account.currentBalance,
    netChangeThisPeriod: s.netChange,
    nextTransfer: null,
    balanceAfterNextTransfer:
      account.nextTransferAmount !== null
        ? account.currentBalance + account.nextTransferAmount
        : null,
    numberOfTransactions: s.count,
  };
}

export function buildAccountSummaries(store: DecryptedStore): LegacyAccountSummary[] {
  const stats = aggregateTransactions(store.transactions);
  return store.accounts.map((a) => buildAccountSummary(a, stats));
}

// ─────────────────────────────────────────────────────────────────────
// Account detail — extends AccountSummary with per-account aggregates
// (inflow/outflow, spentThisCycle for allowance, avgDailyBalance for
// checking, plus the credit-card + allowance-specific structural fields
// the dashboard card reads off the account record).
// ─────────────────────────────────────────────────────────────────────

export interface AccountDetailView extends LegacyAccountSummary {
  inflow: number;
  outflow: number;
  spentThisCycle: number;
  avgDailyBalance: number;
  spendLimit: number | null;
  statementCloseDay: number | null;
  paymentDueDay: number | null;
  topUpAmount: number | null;
  topUpCycle: string | null;
  topUpDay: number | null;
}

interface AccountFlow {
  inflow: number;
  outflow: number;
}

function classifyFlows(account: DecryptedAccount, store: DecryptedStore): AccountFlow {
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  let inflow = 0;
  let outflow = 0;
  for (const tx of store.transactions) {
    const catType = tx.categoryId ? categoriesById.get(tx.categoryId)?.type : undefined;
    const amount = Math.abs(tx.amount);
    if (catType === 'transfer') {
      if (tx.fromAccountId === account.id) {
        outflow += amount;
      }
      if (tx.toAccountId === account.id) {
        inflow += amount;
      }
    } else if (catType === 'income') {
      if (tx.fromAccountId === account.id) {
        inflow += amount;
      }
    } else if (catType === 'expense') {
      if (tx.fromAccountId === account.id) {
        outflow += amount;
      }
    }
  }
  return { inflow, outflow };
}

// Average daily balance across the period: reconstruct the day-by-day
// running balance from the balance history (same series the sparkline
// renders), then average the point values. Falls back to the current
// balance if the account has no transactions this period.
function averageDailyBalance(accountId: string, store: DecryptedStore): number {
  const account = store.accounts.find((a) => a.id === accountId);
  if (!account) {
    return 0;
  }
  const history = buildBalanceHistory(accountId, store);
  if (history.length === 0) {
    return account.currentBalance;
  }
  const sum = history.reduce((acc, p) => acc + p.balance, 0);
  return Math.round(sum / history.length);
}

export function buildAccountDetail(
  accountId: string,
  store: DecryptedStore
): AccountDetailView | null {
  const account = store.accounts.find((a) => a.id === accountId);
  if (!account) {
    return null;
  }
  const stats = aggregateTransactions(store.transactions);
  const summary = buildAccountSummary(account, stats);
  const { inflow, outflow } = classifyFlows(account, store);
  const spentThisCycle = account.accountType === 'allowance' ? outflow : 0;
  const avgDailyBalance =
    account.accountType === 'checking' ? averageDailyBalance(accountId, store) : 0;

  return {
    ...summary,
    inflow,
    outflow,
    spentThisCycle,
    avgDailyBalance,
    spendLimit: account.spendLimit ?? null,
    statementCloseDay: account.statementCloseDay ?? null,
    paymentDueDay: account.paymentDueDay ?? null,
    topUpAmount: account.topUpAmount ?? null,
    topUpCycle: account.topUpCycle ?? null,
    topUpDay: account.topUpDay ?? null,
  };
}

// Net-position aggregate used by the accounts header card + dashboard.
export interface NetPositionView {
  total: number;
  liquidAmount: number;
  protectedAmount: number;
  debtAmount: number;
  differenceThisPeriod: number;
  numberOfAccounts: number;
}

export function buildNetPosition(store: DecryptedStore): NetPositionView {
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  const accountsById = new Map(store.accounts.map((a) => [a.id, a]));

  const activeAccounts = store.accounts.filter((a) => a.status === 'active');
  let liquidAmount = 0;
  let protectedAmount = 0;
  let debtAmount = 0;
  for (const a of activeAccounts) {
    if (a.accountType === 'creditcard') {
      debtAmount += Math.abs(Math.min(0, a.currentBalance));
    } else if (a.accountType === 'savings') {
      protectedAmount += Math.max(0, a.currentBalance);
    } else {
      liquidAmount += Math.max(0, a.currentBalance);
    }
  }

  // Period delta: inflows (income) minus outflows that count toward the
  // budget (respecting the allowance-envelope rule).
  let inflow = 0;
  let outflow = 0;
  for (const tx of store.transactions) {
    const cat = tx.categoryId ? categoriesById.get(tx.categoryId) : undefined;
    if (cat?.type === 'income') {
      inflow += tx.amount;
    } else if (countsAsBudgetExpense(tx, categoriesById, accountsById)) {
      outflow += Math.abs(tx.amount);
    }
  }

  return {
    total: liquidAmount + protectedAmount - debtAmount,
    liquidAmount,
    protectedAmount,
    debtAmount,
    differenceThisPeriod: inflow - outflow,
    numberOfAccounts: activeAccounts.length,
  };
}

// Running balance series for the sparkline: starts at (currentBalance minus
// net change through the period) and steps through each transaction in date
// order. Produces the same `{ date, balance, transactionCount }` shape the
// old /balance-history endpoint emitted so consumers render without changes.
export interface BalanceHistoryPoint {
  date: string;
  balance: number;
  transactionCount: number;
}

export function buildBalanceHistory(
  accountId: string,
  store: DecryptedStore
): BalanceHistoryPoint[] {
  const account = store.accounts.find((a) => a.id === accountId);
  if (!account) {
    return [];
  }
  const relevant = store.transactions
    .filter((tx) => tx.fromAccountId === accountId || tx.toAccountId === accountId)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  // Reconstruct the opening balance by reversing the period's net change.
  let net = 0;
  for (const tx of relevant) {
    const amount = Math.abs(tx.amount);
    if (tx.fromAccountId === accountId) {
      net -= amount;
    }
    if (tx.toAccountId === accountId) {
      net += amount;
    }
  }
  let running = account.currentBalance - net;

  const points: BalanceHistoryPoint[] = [];
  const countByDate = new Map<string, number>();
  for (const tx of relevant) {
    const amount = Math.abs(tx.amount);
    if (tx.fromAccountId === accountId) {
      running -= amount;
    }
    if (tx.toAccountId === accountId) {
      running += amount;
    }
    const prevCount = countByDate.get(tx.date) ?? 0;
    countByDate.set(tx.date, prevCount + 1);
    points.push({ date: tx.date, balance: running, transactionCount: prevCount + 1 });
  }
  return points;
}
