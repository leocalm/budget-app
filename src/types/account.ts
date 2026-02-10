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
  balancePerDay: BalancePerDay[];
  balanceChangeThisPeriod: number;
  transactionCount: number;
}

export interface AccountRequest {
  name: string;
  color: string;
  icon: string;
  accountType: AccountType;
  currency: string;
  balance: number;
  spendLimit?: number;
}

export interface AccountsPage {
  accounts: AccountResponse[];
  nextCursor: string | null;
}
