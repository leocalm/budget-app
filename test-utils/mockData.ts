import { AccountResponse, CurrencyResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';

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

export const createMockCategory = (overrides?: Partial<CategoryResponse>): CategoryResponse => ({
  id: '1',
  name: 'Test Category',
  color: '#00d4ff',
  icon: '🏷️',
  parentId: null,
  categoryType: 'Outgoing',
  ...overrides,
});
