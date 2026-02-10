import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAccount,
  deleteAccount,
  fetchAccounts,
  fetchAccountsPage,
  updateAccount,
} from '@/api/account';
import type { AccountRequest } from '@/types/account';
import { queryKeys } from './queryKeys';
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useInfiniteAccounts,
  useUpdateAccount,
} from './useAccounts';

vi.mock('@/api/account', () => ({
  createAccount: vi.fn(),
  fetchAccounts: vi.fn(),
  fetchAccountsPage: vi.fn(),
  deleteAccount: vi.fn(),
  updateAccount: vi.fn(),
}));

const mockCreateAccount = vi.mocked(createAccount);
const mockFetchAccounts = vi.mocked(fetchAccounts);
const mockFetchAccountsPage = vi.mocked(fetchAccountsPage);
const mockDeleteAccount = vi.mocked(deleteAccount);
const mockUpdateAccount = vi.mocked(updateAccount);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe('useAccounts', () => {
  beforeEach(() => {
    mockCreateAccount.mockReset();
    mockFetchAccounts.mockReset();
    mockFetchAccountsPage.mockReset();
    mockDeleteAccount.mockReset();
    mockUpdateAccount.mockReset();
  });

  it('fetches accounts', async () => {
    const { wrapper } = createWrapper();
    mockFetchAccounts.mockResolvedValue([]);

    const { result } = renderHook(() => useAccounts('period-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchAccounts).toHaveBeenCalledWith('period-1');
  });

  it('caches accounts per period id', async () => {
    const { wrapper, queryClient } = createWrapper();
    mockFetchAccounts.mockResolvedValue([]);

    const periodOneHook = renderHook(() => useAccounts('period-1'), { wrapper });

    await waitFor(() => {
      expect(periodOneHook.result.current.isSuccess).toBe(true);
    });

    const periodTwoHook = renderHook(() => useAccounts('period-2'), { wrapper });

    await waitFor(() => {
      expect(periodTwoHook.result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryState(queryKeys.accounts('period-1'))?.status).toBe('success');
    expect(queryClient.getQueryState(queryKeys.accounts('period-2'))?.status).toBe('success');
  });

  it('invalidates accounts and total assets after delete', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockDeleteAccount.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await result.current.mutateAsync('account-1');

    expect(mockDeleteAccount).toHaveBeenCalledWith('account-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.accounts() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.totalAssets() });
  });

  it('invalidates accounts after create', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const payload: AccountRequest = {
      name: 'Checking',
      color: '#000000',
      icon: '🏦',
      accountType: 'Checking',
      currency: 'USD',
      balance: 1200,
    };

    mockCreateAccount.mockResolvedValue({
      id: 'account-1',
      name: 'Checking',
      color: '#000000',
      icon: '🏦',
      accountType: 'Checking',
      balance: 1200,
      balancePerDay: [],
      balanceChangeThisPeriod: 0,
      transactionCount: 0,
      currency: {
        id: 'currency-1',
        name: 'USD',
        symbol: '$',
        currency: 'USD',
        decimalPlaces: 2,
      },
    });

    const { result } = renderHook(() => useCreateAccount(), { wrapper });

    await result.current.mutateAsync(payload);

    expect(mockCreateAccount).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.accounts() });
  });

  it('invalidates accounts after update', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockUpdateAccount.mockResolvedValue({
      id: 'account-1',
      name: 'Checking',
      color: '#000000',
      icon: '🏦',
      accountType: 'Checking',
      balance: 1200,
      balancePerDay: [],
      balanceChangeThisPeriod: 0,
      transactionCount: 0,
      currency: {
        id: 'currency-1',
        name: 'USD',
        symbol: '$',
        currency: 'USD',
        decimalPlaces: 2,
      },
    });

    const { result } = renderHook(() => useUpdateAccount(), { wrapper });

    const payload: AccountRequest = {
      name: 'Checking',
      color: '#000000',
      icon: '🏦',
      accountType: 'Checking',
      currency: 'USD',
      balance: 1200,
    };

    await result.current.mutateAsync({ id: 'account-1', payload });

    expect(mockUpdateAccount).toHaveBeenCalledWith('account-1', payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.accounts() });
  });

  it('does not fetch paginated accounts when the period id is null', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useInfiniteAccounts(null), { wrapper });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockFetchAccountsPage).not.toHaveBeenCalled();
  });

  it('fetches paginated accounts and loads the next page with cursor', async () => {
    const { wrapper } = createWrapper();

    mockFetchAccountsPage
      .mockResolvedValueOnce({
        accounts: [
          {
            id: 'account-1',
            name: 'Checking',
            color: '#000000',
            icon: '🏦',
            accountType: 'Checking',
            balance: 1200,
            balancePerDay: [],
            balanceChangeThisPeriod: 0,
            transactionCount: 0,
            currency: {
              id: 'currency-1',
              name: 'USD',
              symbol: '$',
              currency: 'USD',
              decimalPlaces: 2,
            },
          },
        ],
        nextCursor: 'cursor-1',
      })
      .mockResolvedValueOnce({
        accounts: [],
        nextCursor: null,
      });

    const { result } = renderHook(() => useInfiniteAccounts('period-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchAccountsPage).toHaveBeenNthCalledWith(1, {
      selectedPeriodId: 'period-1',
      cursor: null,
      pageSize: 50,
    });

    await result.current.fetchNextPage();

    await waitFor(() => {
      expect(mockFetchAccountsPage).toHaveBeenCalledTimes(2);
    });

    expect(mockFetchAccountsPage).toHaveBeenNthCalledWith(2, {
      selectedPeriodId: 'period-1',
      cursor: 'cursor-1',
      pageSize: 50,
    });
  });
});
