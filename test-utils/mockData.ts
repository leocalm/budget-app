import { AccountResponse, CurrencyResponse } from '@/types/account';

export const mockCurrency: CurrencyResponse = {
  id: 'usd',
  name: 'US Dollar',
  symbol: '$',
  currency: 'USD',
  decimalPlaces: 2,
};

export const createMockAccount = (overrides?: Partial<AccountResponse>): AccountResponse => ({
  id: '1',
  name: 'Test Account',
  color: '#00d4ff',
  icon: '💳',
  accountType: 'Checking',
  currency: mockCurrency,
  balance: 100000,
  balancePerDay: [],
  balanceChangeThisPeriod: 0,
  transactionCount: 0,
  ...overrides,
});
