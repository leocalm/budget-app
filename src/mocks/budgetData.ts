import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';

export const mockAccounts: AccountResponse[] = [
  {
    id: 'acc-1',
    name: 'Checking',
    accountType: 'Checking',
    balance: 0,
    color: 'blue',
    icon: 'wallet',
    currency: {
      id: 'cur-1',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimalPlaces: 2,
    },
    spendLimit: 0,
  },
  {
    id: 'acc-2',
    name: 'Savings',
    accountType: 'Savings',
    balance: 0,
    color: 'teal',
    icon: 'pig',
    currency: {
      id: 'cur-1',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimalPlaces: 2,
    },
    spendLimit: 0,
  },
];

export const mockCategories: CategoryResponse[] = [
  {
    id: 'cat-out-1',
    name: 'Food',
    icon: 'shopping-cart',
    categoryType: 'Outgoing',
    color: '',
    parentId: null,
  },
  {
    id: 'cat-in-1',
    name: 'Salary',
    icon: 'cash',
    categoryType: 'Incoming',
    color: '',
    parentId: null,
  },
  {
    id: 'cat-tr-1',
    name: 'Transfer',
    icon: 'repeat',
    categoryType: 'Transfer',
    color: '',
    parentId: null,
  },
];

export const initialVendors: Vendor[] = [{ id: 'ven-1', name: 'Supermarket' }];

export const initialTransactions: TransactionResponse[] = [
  {
    id: 'tx-1',
    description: 'Groceries',
    occurredAt: '2026-01-10',
    amount: 4599,
    category: mockCategories[0],
    fromAccount: mockAccounts[0],
    toAccount: null,
    vendor: initialVendors[0],
  },
  {
    id: 'tx-2',
    description: 'January Salary',
    occurredAt: '2026-01-01',
    amount: 250000,
    category: mockCategories[1],
    fromAccount: mockAccounts[0],
    toAccount: null,
    vendor: null,
  },
  {
    id: 'tx-3',
    description: 'Move to savings',
    occurredAt: '2026-01-12',
    amount: 50000,
    category: mockCategories[2],
    fromAccount: mockAccounts[0],
    toAccount: mockAccounts[1],
    vendor: null,
  },
];
