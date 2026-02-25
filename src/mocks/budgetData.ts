import {
  AccountContext,
  AccountDetail,
  AccountManagementResponse,
  AccountResponse,
} from '@/types/account';
import {
  BudgetedCategoryDiagnostic,
  CategoriesManagementListResponse,
  CategoryResponse,
  CategoryWithStats,
  UnbudgetedCategoryDiagnostic,
} from '@/types/category';
import { CategoryTargetsResponse } from '@/types/categoryTarget';
import {
  BudgetStability,
  MonthlyBurnIn,
  MonthProgress,
  NetPosition,
  SpentPerCategory,
} from '@/types/dashboard';
import { TransactionResponse } from '@/types/transaction';
import { Vendor, VendorWithStats } from '@/types/vendor';

export const mockAccounts: AccountResponse[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    accountType: 'Checking',
    balance: 145000,
    balancePerDay: [
      { date: '2026-01-01', balance: 140000 },
      { date: '2026-01-05', balance: 142500 },
      { date: '2026-01-10', balance: 145000 },
    ],
    balanceChangeThisPeriod: 5000,
    transactionCount: 23,
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
    isArchived: false,
    nextTransferAmount: undefined,
  },
  {
    id: 'acc-2',
    name: 'Emergency Fund',
    accountType: 'Savings',
    balance: 500000,
    balancePerDay: [
      { date: '2026-01-01', balance: 475000 },
      { date: '2026-01-05', balance: 487500 },
      { date: '2026-01-10', balance: 500000 },
    ],
    balanceChangeThisPeriod: 25000,
    transactionCount: 2,
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
    isArchived: false,
    nextTransferAmount: undefined,
  },
  {
    id: 'acc-3',
    name: 'Credit Card',
    accountType: 'CreditCard',
    balance: -75000,
    balancePerDay: [
      { date: '2026-01-01', balance: -65000 },
      { date: '2026-01-05', balance: -70000 },
      { date: '2026-01-10', balance: -75000 },
    ],
    balanceChangeThisPeriod: -10000,
    transactionCount: 15,
    color: 'red',
    icon: 'creditCard',
    currency: {
      id: 'cur-1',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimalPlaces: 2,
    },
    spendLimit: 0,
    isArchived: false,
    nextTransferAmount: undefined,
  },
  {
    id: 'acc-4',
    name: 'Pocket Money',
    accountType: 'Allowance',
    balance: 25000,
    balancePerDay: [
      { date: '2026-01-01', balance: 30000 },
      { date: '2026-01-05', balance: 27500 },
      { date: '2026-01-10', balance: 25000 },
    ],
    balanceChangeThisPeriod: -5000,
    transactionCount: 8,
    color: 'grape',
    icon: 'wallet',
    currency: {
      id: 'cur-1',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimalPlaces: 2,
    },
    spendLimit: 30000,
    isArchived: false,
    nextTransferAmount: 5000,
  },
  {
    id: 'acc-5',
    name: 'Cash Wallet',
    accountType: 'Wallet',
    balance: 8500,
    balancePerDay: [
      { date: '2026-01-01', balance: 10000 },
      { date: '2026-01-05', balance: 9250 },
      { date: '2026-01-10', balance: 8500 },
    ],
    balanceChangeThisPeriod: -1500,
    transactionCount: 12,
    color: 'green',
    icon: 'cash',
    currency: {
      id: 'cur-1',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimalPlaces: 2,
    },
    spendLimit: 0,
    isArchived: false,
    nextTransferAmount: undefined,
  },
];

export const mockCategories: CategoryResponse[] = [
  {
    id: 'cat-out-1',
    name: 'Food',
    icon: 'cart',
    categoryType: 'Outgoing',
    color: '#ff6b9d',
    parentId: null,
    isArchived: false,
    description: null,
  },
  {
    id: 'cat-in-1',
    name: 'Salary',
    icon: 'cash',
    categoryType: 'Incoming',
    color: '#00ffa3',
    parentId: null,
    isArchived: false,
    description: null,
  },
  {
    id: 'cat-tr-1',
    name: 'Transfer',
    icon: 'repeat',
    categoryType: 'Transfer',
    color: '#00d4ff',
    parentId: null,
    isArchived: false,
    description: null,
  },
];

export const initialVendors: Vendor[] = [{ id: 'ven-1', name: 'Supermarket', archived: false }];

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

// ─── SHARED CURRENCY ────────────────────────────────────────────────────────

export const euroCurrency = {
  id: 'cur-1',
  name: 'Euro',
  symbol: '€',
  currency: 'EUR',
  decimalPlaces: 2,
};

export const usdCurrency = {
  id: 'cur-2',
  name: 'US Dollar',
  symbol: '$',
  currency: 'USD',
  decimalPlaces: 2,
};

export const gbpCurrency = {
  id: 'currency-gbp',
  name: 'British Pound',
  symbol: '£',
  currency: 'GBP',
  decimalPlaces: 2,
};

// ─── NAMED ACCOUNT VARIANTS ──────────────────────────────────────────────────

export const mockCheckingAccount = mockAccounts[0]; // 'acc-1' Main Checking
export const mockSavingsAccount = mockAccounts[1]; // 'acc-2' Emergency Fund
export const mockCreditCardAccount = mockAccounts[2]; // 'acc-3' Credit Card
export const mockAllowanceAccount = mockAccounts[3]; // 'acc-4' Pocket Money
export const mockWalletAccount = mockAccounts[4]; // 'acc-5' Cash Wallet

export const mockArchivedAccount: AccountResponse = {
  ...mockCheckingAccount,
  id: 'acc-archived',
  name: 'Old Bank Account',
  isArchived: true,
  balance: 0,
  transactionCount: 0,
};

export const mockAccountWithSpendLimit: AccountResponse = {
  ...mockCheckingAccount,
  id: 'acc-spend-limit',
  name: 'Daily Spending',
  color: 'orange',
  spendLimit: 50000,
  balance: 32000,
};

export const mockAccountManagementList: AccountManagementResponse[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    accountType: 'Checking',
    color: 'blue',
    icon: 'wallet',
    currency: euroCurrency,
    balance: 145000,
    spendLimit: undefined,
    isArchived: false,
    nextTransferAmount: undefined,
    transactionCount: 23,
    canDelete: false,
    canAdjustBalance: true,
  },
  {
    id: 'acc-2',
    name: 'Emergency Fund',
    accountType: 'Savings',
    color: 'teal',
    icon: 'pig',
    currency: euroCurrency,
    balance: 500000,
    spendLimit: undefined,
    isArchived: false,
    nextTransferAmount: undefined,
    transactionCount: 2,
    canDelete: false,
    canAdjustBalance: true,
  },
  {
    id: 'acc-3',
    name: 'Credit Card',
    accountType: 'CreditCard',
    color: 'red',
    icon: 'creditCard',
    currency: euroCurrency,
    balance: -75000,
    spendLimit: undefined,
    isArchived: false,
    nextTransferAmount: undefined,
    transactionCount: 15,
    canDelete: false,
    canAdjustBalance: false,
  },
  {
    id: 'acc-archived',
    name: 'Old Bank Account',
    accountType: 'Checking',
    color: 'gray',
    icon: 'wallet',
    currency: euroCurrency,
    balance: 0,
    spendLimit: undefined,
    isArchived: true,
    nextTransferAmount: undefined,
    transactionCount: 0,
    canDelete: true,
    canAdjustBalance: false,
  },
];

export const mockAccountDetail: AccountDetail = {
  balance: 145000,
  balanceChange: 5000,
  inflows: 250000,
  outflows: 245000,
  net: 5000,
  periodStart: '2026-01-01',
  periodEnd: '2026-01-31',
};

export const mockAccountContext: AccountContext = {
  categoryImpact: [
    { categoryName: 'Food', amount: 45000, percentage: 4500 },
    { categoryName: 'Transport', amount: 25000, percentage: 2500 },
    { categoryName: 'Entertainment', amount: 15000, percentage: 1500 },
    { categoryName: 'Utilities', amount: 10000, percentage: 1000 },
    { categoryName: 'Other', amount: 5000, percentage: 500 },
  ],
  stability: {
    periodsClosedPositive: 10,
    periodsEvaluated: 12,
    avgClosingBalance: 135000,
    highestClosingBalance: 185000,
    lowestClosingBalance: 82000,
    largestSingleOutflow: 95000,
    largestSingleOutflowCategory: 'Rent',
  },
};

export const mockBalanceHistory = [
  { date: '2025-08-01', balance: 95000 },
  { date: '2025-09-01', balance: 108000 },
  { date: '2025-10-01', balance: 121000 },
  { date: '2025-11-01', balance: 115000 },
  { date: '2025-12-01', balance: 138000 },
  { date: '2026-01-01', balance: 140000 },
  { date: '2026-01-10', balance: 145000 },
];

// ─── NAMED CATEGORY VARIANTS ─────────────────────────────────────────────────

export const mockOutgoingCategory = mockCategories[0]; // Food
export const mockIncomingCategory = mockCategories[1]; // Salary
export const mockTransferCategory = mockCategories[2]; // Transfer

export const mockArchivedCategory: (typeof mockCategories)[0] = {
  ...mockOutgoingCategory,
  id: 'cat-archived',
  name: 'Old Expenses',
  isArchived: true,
};

export const mockCategoryWithStats: CategoryWithStats[] = [
  {
    ...mockOutgoingCategory,
    usedInPeriod: 42000,
    differenceVsAveragePercentage: -12,
    transactionCount: 8,
  },
  {
    ...mockIncomingCategory,
    usedInPeriod: 250000,
    differenceVsAveragePercentage: 0,
    transactionCount: 1,
  },
  {
    id: 'cat-out-2',
    name: 'Transport',
    icon: 'car',
    categoryType: 'Outgoing',
    color: '#4dabf7',
    parentId: null,
    isArchived: false,
    description: 'Daily commute and travel',
    usedInPeriod: 18500,
    differenceVsAveragePercentage: 23,
    transactionCount: 12,
  },
  {
    id: 'cat-out-3',
    name: 'Entertainment',
    icon: 'device-tv',
    categoryType: 'Outgoing',
    color: '#f783ac',
    parentId: null,
    isArchived: false,
    description: null,
    usedInPeriod: 9800,
    differenceVsAveragePercentage: -5,
    transactionCount: 4,
  },
];

export const mockBudgetedDiagnosticRows: BudgetedCategoryDiagnostic[] = [
  {
    id: 'cat-out-1',
    name: 'Food',
    color: '#ff6b9d',
    icon: 'cart',
    parentId: null,
    categoryType: 'Outgoing',
    isArchived: false,
    description: null,
    budgetedValue: 50000,
    actualValue: 42000,
    varianceValue: -8000,
    progressBasisPoints: 8400,
    recentClosedPeriods: [
      { periodId: 'p1', isOutsideTolerance: false },
      { periodId: 'p2', isOutsideTolerance: true },
      { periodId: 'p3', isOutsideTolerance: false },
    ],
  },
  {
    id: 'cat-out-2',
    name: 'Transport',
    color: '#4dabf7',
    icon: 'car',
    parentId: null,
    categoryType: 'Outgoing',
    isArchived: false,
    description: null,
    budgetedValue: 20000,
    actualValue: 18500,
    varianceValue: -1500,
    progressBasisPoints: 9250,
    recentClosedPeriods: [
      { periodId: 'p1', isOutsideTolerance: false },
      { periodId: 'p2', isOutsideTolerance: false },
      { periodId: 'p3', isOutsideTolerance: true },
    ],
  },
];

export const mockUnbudgetedDiagnosticRows: UnbudgetedCategoryDiagnostic[] = [
  {
    id: 'cat-out-3',
    name: 'Entertainment',
    color: '#f783ac',
    icon: 'device-tv',
    parentId: null,
    categoryType: 'Outgoing',
    isArchived: false,
    description: null,
    actualValue: 9800,
    shareOfTotalBasisPoints: 1200,
  },
];

export const mockCategoriesManagement: CategoriesManagementListResponse = {
  incoming: [
    {
      id: 'cat-in-1',
      name: 'Salary',
      icon: 'cash',
      categoryType: 'Incoming',
      color: '#00ffa3',
      parentId: null,
      isArchived: false,
      description: null,
      globalTransactionCount: 24,
      activeChildrenCount: 0,
    },
  ],
  outgoing: [
    {
      id: 'cat-out-1',
      name: 'Food',
      icon: 'cart',
      categoryType: 'Outgoing',
      color: '#ff6b9d',
      parentId: null,
      isArchived: false,
      description: null,
      globalTransactionCount: 120,
      activeChildrenCount: 2,
    },
    {
      id: 'cat-out-2',
      name: 'Transport',
      icon: 'car',
      categoryType: 'Outgoing',
      color: '#4dabf7',
      parentId: null,
      isArchived: false,
      description: 'Daily commute and travel',
      globalTransactionCount: 45,
      activeChildrenCount: 0,
    },
  ],
  archived: [
    {
      id: 'cat-archived',
      name: 'Old Expenses',
      icon: 'archive',
      categoryType: 'Outgoing',
      color: '#868e96',
      parentId: null,
      isArchived: true,
      description: null,
      globalTransactionCount: 12,
      activeChildrenCount: 0,
    },
  ],
};

// ─── NAMED TRANSACTION VARIANTS ──────────────────────────────────────────────

export const mockExpenseTransaction = initialTransactions[0]; // Groceries
export const mockIncomeTransaction = initialTransactions[1]; // January Salary
export const mockTransferTransaction = initialTransactions[2]; // Move to savings

// ─── NAMED VENDOR VARIANTS ───────────────────────────────────────────────────

export const mockVendorsWithStats: VendorWithStats[] = [
  {
    id: 'ven-1',
    name: 'Supermarket',
    description: 'Weekly grocery shopping',
    archived: false,
    transactionCount: 24,
    lastUsedAt: '2026-01-10',
  },
  {
    id: 'ven-2',
    name: 'Coffee Shop',
    description: undefined,
    archived: false,
    transactionCount: 8,
    lastUsedAt: '2026-01-12',
  },
  {
    id: 'ven-3',
    name: 'Gas Station',
    description: 'Fuel and car products',
    archived: false,
    transactionCount: 6,
    lastUsedAt: '2026-01-09',
  },
  {
    id: 'ven-archived',
    name: 'Old Store',
    description: undefined,
    archived: true,
    transactionCount: 2,
    lastUsedAt: '2025-06-01',
  },
];

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export const mockMonthlyBurnIn: MonthlyBurnIn = {
  totalBudget: 200000,
  spentBudget: 85000,
  currentDay: 15,
  daysInPeriod: 30,
};

export const mockMonthProgress: MonthProgress = {
  currentDate: '2026-01-15',
  daysInPeriod: 31,
  remainingDays: 16,
  daysPassedPercentage: 48,
};

export const mockNetPosition: NetPosition = {
  totalNetPosition: 603500,
  changeThisPeriod: 19000,
  liquidBalance: 178500,
  protectedBalance: 500000,
  debtBalance: -75000,
  accountCount: 5,
};

export const mockBudgetStability: BudgetStability = {
  withinTolerancePercentage: 78,
  periodsWithinTolerance: 18,
  totalClosedPeriods: 23,
  recentClosedPeriods: [
    { periodId: 'p1', isOutsideTolerance: false },
    { periodId: 'p2', isOutsideTolerance: true },
    { periodId: 'p3', isOutsideTolerance: false },
    { periodId: 'p4', isOutsideTolerance: true },
    { periodId: 'p5', isOutsideTolerance: false },
    { periodId: 'p6', isOutsideTolerance: false },
  ],
};

export const mockSpentPerCategory: SpentPerCategory[] = [
  { categoryName: 'Food', budgetedValue: 50000, amountSpent: 42000, percentageSpent: 84 },
  { categoryName: 'Transport', budgetedValue: 20000, amountSpent: 18500, percentageSpent: 92 },
  { categoryName: 'Entertainment', budgetedValue: 15000, amountSpent: 9800, percentageSpent: 65 },
  { categoryName: 'Utilities', budgetedValue: 12000, amountSpent: 11200, percentageSpent: 93 },
  { categoryName: 'Health', budgetedValue: 10000, amountSpent: 3500, percentageSpent: 35 },
];

export const mockBudgetPerDay = [
  { accountName: 'Main Checking', date: '2026-01-01', balance: 140000 },
  { accountName: 'Main Checking', date: '2026-01-05', balance: 137000 },
  { accountName: 'Main Checking', date: '2026-01-10', balance: 145000 },
  { accountName: 'Main Checking', date: '2026-01-15', balance: 141000 },
];

// ─── CATEGORY TARGETS ────────────────────────────────────────────────────────

export const mockCategoryTargets: CategoryTargetsResponse = {
  periodId: 'per-1',
  periodName: 'January 2026',
  periodStartDate: '2026-01-01',
  periodEndDate: '2026-01-31',
  periodProgressPercent: 48,
  totalTargeted: 200000,
  totalCategories: 8,
  targetedCategories: 5,
  outgoingTargets: [
    {
      id: 'ct-1',
      categoryId: 'cat-out-1',
      categoryName: 'Food',
      categoryType: 'Outgoing',
      categoryIcon: 'cart',
      categoryColor: '#ff6b9d',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: 50000,
      previousTarget: 48000,
      isExcluded: false,
      exclusionReason: null,
      projectedVarianceBasisPoints: -500,
    },
    {
      id: 'ct-2',
      categoryId: 'cat-out-2',
      categoryName: 'Transport',
      categoryType: 'Outgoing',
      categoryIcon: 'car',
      categoryColor: '#4dabf7',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: 20000,
      previousTarget: 20000,
      isExcluded: false,
      exclusionReason: null,
      projectedVarianceBasisPoints: 200,
    },
    {
      id: 'ct-3',
      categoryId: 'cat-out-3',
      categoryName: 'Entertainment',
      categoryType: 'Outgoing',
      categoryIcon: 'device-tv',
      categoryColor: '#f783ac',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: null,
      previousTarget: 15000,
      isExcluded: false,
      exclusionReason: null,
      projectedVarianceBasisPoints: null,
    },
  ],
  incomingTargets: [
    {
      id: 'ct-4',
      categoryId: 'cat-in-1',
      categoryName: 'Salary',
      categoryType: 'Incoming',
      categoryIcon: 'cash',
      categoryColor: '#00ffa3',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: 250000,
      previousTarget: 250000,
      isExcluded: false,
      exclusionReason: null,
      projectedVarianceBasisPoints: 0,
    },
  ],
  excludedCategories: [
    {
      id: 'ct-5',
      categoryId: 'cat-tr-1',
      categoryName: 'Transfer',
      categoryType: 'Transfer',
      categoryIcon: 'repeat',
      categoryColor: '#00d4ff',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: null,
      previousTarget: null,
      isExcluded: true,
      exclusionReason: 'Transfer categories are excluded from budget targets',
      projectedVarianceBasisPoints: null,
    },
  ],
};

// ─── OVERLAYS ────────────────────────────────────────────────────────────────

export const mockActiveOverlay = {
  id: 'ovl-1',
  name: 'Holiday Trip',
  icon: '🏖️',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  inclusionMode: 'all' as const,
  totalCapAmount: 150000,
  spentAmount: 62000,
  transactionCount: 8,
};
