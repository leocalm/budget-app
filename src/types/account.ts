export const ACCOUNT_TYPES = ['Checking', 'Savings', 'CreditCard', 'Wallet', 'Allowance'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface CurrencyResponse {
  id: string;
  name: string;
  symbol: string;
  currency: string;
  decimalPlaces: number;
}

export interface BalancePerDay {
  date: string;
  balance: number;
}

export interface AccountResponse {
  id: string;
  name: string;
  color: string;
  icon: string;
  accountType: AccountType;
  currency: CurrencyResponse;
  balance: number;
  spendLimit?: number;
  isArchived: boolean;
  nextTransferAmount?: number;
  balancePerDay: BalancePerDay[];
  balanceChangeThisPeriod: number;
  transactionCount: number;
}

export interface AccountRequest {
  name: string;
  color: string;
  icon: string;
  accountType: AccountType;
  balance: number;
  spendLimit?: number;
  nextTransferAmount?: number;
}

export interface AdjustStartingBalanceRequest {
  newBalance: number;
}

export interface AccountManagementResponse {
  id: string;
  name: string;
  color: string;
  icon: string;
  accountType: AccountType;
  currency: CurrencyResponse;
  balance: number;
  spendLimit?: number;
  isArchived: boolean;
  nextTransferAmount?: number;
  transactionCount: number;
  canDelete: boolean;
  canAdjustBalance: boolean;
}

export interface AccountsPage {
  accounts: AccountResponse[];
  nextCursor: string | null;
}

export interface AccountDetail {
  balance: number;
  balanceChange: number;
  inflows: number;
  outflows: number;
  net: number;
  periodStart: string;
  periodEnd: string;
}

export interface BalanceHistoryPoint {
  date: string;
  balance: number;
}

export interface AccountTransaction {
  id: string;
  amount: number;
  description: string;
  occurredAt: string;
  categoryName: string;
  categoryColor: string;
  flow: 'in' | 'out';
  runningBalance: number;
}

export interface AccountTransactionsPage {
  data: AccountTransaction[];
  nextCursor: string | null;
}

export interface CategoryImpactItem {
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface AccountStability {
  periodsClosedPositive: number;
  periodsEvaluated: number;
  avgClosingBalance: number;
  highestClosingBalance: number;
  lowestClosingBalance: number;
  largestSingleOutflow: number;
  largestSingleOutflowCategory: string;
}

export interface AccountContext {
  categoryImpact: CategoryImpactItem[];
  stability: AccountStability;
}
