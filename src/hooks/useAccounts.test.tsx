import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAccount, deleteAccount, fetchAccounts, updateAccount } from '@/api/account';
import type { AccountRequest } from '@/types/account';
import { queryKeys } from './queryKeys';
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from './useAccounts';

vi.mock('@/api/account', () => ({
  createAccount: vi.fn(),
  fetchAccounts: vi.fn(),
  deleteAccount: vi.fn(),
  updateAccount: vi.fn(),
}));

const mockCreateAccount = vi.mocked(createAccount);
const mockFetchAccounts = vi.mocked(fetchAccounts);
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

  it('refetches accounts after delete', async () => {
    const { wrapper, queryClient } = createWrapper();
    const refetchSpy = vi.spyOn(queryClient, 'refetchQueries');
    mockDeleteAccount.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await result.current.mutateAsync('account-1');

    expect(mockDeleteAccount).toHaveBeenCalledWith('account-1');
    expect(refetchSpy).toHaveBeenCalledWith({ queryKey: queryKeys.accounts() });
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
});
