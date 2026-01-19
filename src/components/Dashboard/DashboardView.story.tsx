import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { DashboardData } from '@/types/dashboard';
import { Vendor } from '@/types/vendor';
import { DashboardView } from './DashboardView';

const mockAccounts: AccountResponse[] = [
  {
    id: '1',
    name: 'Main Checking',
    color: '#228be6',
    icon: 'wallet',
    accountType: 'Checking',
    currency: { id: '1', name: 'Euro', symbol: '€', currency: 'EUR', decimalPlaces: 2 },
    balance: 150000,
  },
  {
    id: '2',
    name: 'Savings',
    color: '#40c057',
    icon: 'piggy-bank',
    accountType: 'Savings',
    currency: { id: '1', name: 'Euro', symbol: '€', currency: 'EUR', decimalPlaces: 2 },
    balance: 500000,
  },
];

const mockCategories: CategoryResponse[] = [
  {
    id: 'c1',
    name: 'Food',
    color: 'blue',
    icon: 'shopping-cart',
    parentId: null,
    categoryType: 'Outgoing',
  },
  {
    id: 'c2',
    name: 'Salary',
    color: 'green',
    icon: 'cash',
    parentId: null,
    categoryType: 'Incoming',
  },
  {
    id: 'c3',
    name: 'Transfer',
    color: 'gray',
    icon: 'arrows-left-right',
    parentId: null,
    categoryType: 'Transfer',
  },
];

const mockVendors: Vendor[] = [
  { id: 'v1', name: 'Supermarket' },
  { id: 'v2', name: 'Employer' },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// Seed the cache
queryClient.setQueryData(['accounts'], mockAccounts);
queryClient.setQueryData(['categories'], mockCategories);
queryClient.setQueryData(['vendors'], mockVendors);

const meta: Meta<typeof DashboardView> = {
  title: 'Components/Dashboard/DashboardView',
  component: DashboardView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DashboardView>;

const mockDashboardData: DashboardData = {
  totalAsset: 650000,
  monthlyBurnIn: {
    totalBudget: 200000,
    spentBudget: 120000,
    currentDay: 15,
    daysInPeriod: 30,
  },
  monthProgress: {
    currentDate: '2023-10-15',
    daysInPeriod: 30,
    remainingDays: 15,
    daysPassedPercentage: 50,
  },
  spentPerCategory: [
    { categoryName: 'Food', budgetedValue: 50000, amountSpent: 30000, percentageSpent: 60 },
    { categoryName: 'Rent', budgetedValue: 100000, amountSpent: 100000, percentageSpent: 100 },
    { categoryName: 'Transport', budgetedValue: 20000, amountSpent: 5000, percentageSpent: 25 },
  ],
  budgetPerDay: [
    { accountName: 'Main Checking', date: '2023-10-01', balance: 140000 },
    { accountName: 'Main Checking', date: '2023-10-05', balance: 135000 },
    { accountName: 'Main Checking', date: '2023-10-10', balance: 145000 },
    { accountName: 'Main Checking', date: '2023-10-15', balance: 150000 },
  ],
  recentTransactions: [
    {
      id: 't1',
      description: 'Grocery Shopping',
      amount: 5000,
      occurredAt: '2023-10-14',
      category: mockCategories[0],
      fromAccount: mockAccounts[0],
      toAccount: null,
      vendor: mockVendors[0],
    },
    {
      id: 't2',
      description: 'Salary',
      amount: 300000,
      occurredAt: '2023-10-01',
      category: mockCategories[1],
      fromAccount: mockAccounts[0],
      toAccount: null,
      vendor: mockVendors[1],
    },
  ],
};

export const Default: Story = {
  args: {
    dashboardData: mockDashboardData,
    accounts: mockAccounts,
  },
};

export const Loading: Story = {
  args: {
    dashboardData: undefined,
    accounts: undefined,
  },
};

export const OverBudget: Story = {
  args: {
    dashboardData: {
      ...mockDashboardData,
      monthlyBurnIn: {
        ...mockDashboardData.monthlyBurnIn,
        spentBudget: 250000,
      },
    },
    accounts: mockAccounts,
  },
};
