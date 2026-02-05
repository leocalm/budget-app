import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTransactions } from './useTransactions';
import { fetchTransactions } from '@/api/transaction';
import { TransactionResponse } from '@/types/transaction';

vi.mock('@/api/transaction', () => ({
  fetchTransactions: vi.fn(),
}));

const mockFetchTransactions = vi.mocked(fetchTransactions);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTransactions', () => {
  beforeEach(() => {
    mockFetchTransactions.mockReset();
  });

  it('does not fetch when the period id is null', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTransactions(null), { wrapper });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockFetchTransactions).not.toHaveBeenCalled();
  });

  it('fetches transactions when a period id is provided', async () => {
    const wrapper = createWrapper();
    const response: TransactionResponse[] = [
      {
        id: 'tx-1',
        description: 'Coffee',
        amount: 450,
        occurredAt: '2026-02-01',
        category: {
          id: 'cat-1',
          name: 'Food',
          icon: '☕',
          color: '#000000',
          parentId: null,
          categoryType: 'Outgoing',
        },
        fromAccount: {
          id: 'acc-1',
          name: 'Checking',
          icon: '🏦',
          color: '#111111',
          accountType: 'Checking',
          balance: 1000,
          currency: {
            id: 'cur-1',
            name: 'US Dollar',
            symbol: '$',
            currency: 'USD',
            decimalPlaces: 2,
          },
        },
        toAccount: null,
        vendor: null,
      },
    ];

    mockFetchTransactions.mockResolvedValue(response);

    const { result } = renderHook(() => useTransactions('period-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTransactions).toHaveBeenCalledWith('period-1');
    expect(result.current.data).toEqual(response);
  });
});
