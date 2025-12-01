export const ACCOUNT_TYPES = ["Checking", "Savings", "CreditCard", "Wallet"] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

export interface CurrencyResponse {
  id: string;
  name: string;
  symbol: string;
  currency: string;
  decimal_places: number;
}

export interface AccountResponse {
  id: string;
  name: string;
  color: string;
  icon: string;
  account_type: AccountType;
  currency: CurrencyResponse;
  balance: number;
}

export interface AccountRequest {
  name: string;
  color: string;
  icon: string;
  account_type: AccountType;
  currency: string;
  balance: number;
}