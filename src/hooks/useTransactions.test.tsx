import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createTransaction,
  createTransactionFromRequest,
  deleteTransaction,
  fetchTransactions,
  fetchTransactionsPage,
  updateTransaction,
} from '@/api/transaction';
import type { Transaction, TransactionRequest, TransactionResponse } from '@/types/transaction';
import { queryKeys } from './queryKeys';
import {
  useCreateTransaction,
  useCreateTransactionFromRequest,
  useDeleteTransaction,
  useInfiniteTransactions,
  useTransactions,
  useUpdateTransaction,
} from './useTransactions';

vi.mock('@/api/transaction', () => ({
  createTransaction: vi.fn(),
  createTransactionFromRequest: vi.fn(),
  deleteTransaction: vi.fn(),
  fetchTransactions: vi.fn(),
  fetchTransactionsPage: vi.fn(),
  updateTransaction: vi.fn(),
}));

const mockCreateTransaction = vi.mocked(createTransaction);
const mockCreateTransactionFromRequest = vi.mocked(createTransactionFromRequest);
const mockDeleteTransaction = vi.mocked(deleteTransaction);
const mockFetchTransactions = vi.mocked(fetchTransactions);
const mockFetchTransactionsPage = vi.mocked(fetchTransactionsPage);
const mockUpdateTransaction = vi.mocked(updateTransaction);

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

describe('useTransactions', () => {
  beforeEach(() => {
    mockFetchTransactions.mockReset();
    mockCreateTransaction.mockReset();
    mockCreateTransactionFromRequest.mockReset();
    mockDeleteTransaction.mockReset();
    mockUpdateTransaction.mockReset();
    mockFetchTransactionsPage.mockReset();
  });

  it('does not fetch when the period id is null', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTransactions(null), { wrapper });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockFetchTransactions).not.toHaveBeenCalled();
  });

  it('fetches transactions when a period id is provided', async () => {
    const { wrapper } = createWrapper();
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
          isArchived: false,
          description: null,
        },
        fromAccount: {
          id: 'acc-1',
          name: 'Checking',
          icon: '🏦',
          color: '#111111',
          accountType: 'Checking',
          balance: 1000,
          balancePerDay: [],
          balanceChangeThisPeriod: 0,
          transactionCount: 0,
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

  it('does not fetch paginated transactions when the period id is null', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useInfiniteTransactions(null), { wrapper });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockFetchTransactionsPage).not.toHaveBeenCalled();
  });

  it('fetches paginated transactions and loads the next page with cursor', async () => {
    const { wrapper } = createWrapper();

    mockFetchTransactionsPage
      .mockResolvedValueOnce({
        transactions: [],
        nextCursor: 'cursor-1',
      })
      .mockResolvedValueOnce({
        transactions: [],
        nextCursor: null,
      });

    const { result } = renderHook(() => useInfiniteTransactions('period-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTransactionsPage).toHaveBeenNthCalledWith(1, {
      selectedPeriodId: 'period-1',
      cursor: null,
      pageSize: 50,
    });

    await result.current.fetchNextPage();

    await waitFor(() => {
      expect(mockFetchTransactionsPage).toHaveBeenCalledTimes(2);
    });

    expect(mockFetchTransactionsPage).toHaveBeenNthCalledWith(2, {
      selectedPeriodId: 'period-1',
      cursor: 'cursor-1',
      pageSize: 50,
    });
  });

  it('invalidates transactions after delete', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockDeleteTransaction.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTransaction(null), { wrapper });

    await result.current.mutateAsync('tx-1');

    expect(mockDeleteTransaction.mock.calls[0]?.[0]).toBe('tx-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.transactions() });
  });

  it('invalidates transactions after create', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockCreateTransaction.mockResolvedValue({
      id: 'tx-2',
      description: 'Book',
      amount: 1500,
      occurredAt: '2026-02-02',
      category: {
        id: 'cat-1',
        name: 'Shopping',
        icon: '📚',
        color: '#333333',
        parentId: null,
        categoryType: 'Outgoing',
        isArchived: false,
        description: null,
      },
      fromAccount: {
        id: 'acc-1',
        name: 'Checking',
        icon: '🏦',
        color: '#111111',
        accountType: 'Checking',
        balance: 1000,
        balancePerDay: [],
        balanceChangeThisPeriod: 0,
        transactionCount: 0,
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
    });

    const { result } = renderHook(() => useCreateTransaction(null), { wrapper });

    const payload: Transaction = {
      description: 'Book',
      amount: 1500,
      occurredAt: '2026-02-02',
      category: undefined,
      fromAccount: undefined,
      toAccount: undefined,
      vendor: undefined,
    };

    await result.current.mutateAsync(payload);

    expect(mockCreateTransaction).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.transactions() });
  });

  it('invalidates transactions after create from request', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockCreateTransactionFromRequest.mockResolvedValue({
      id: 'tx-3',
      description: 'Rent',
      amount: 100000,
      occurredAt: '2026-02-03',
      category: {
        id: 'cat-2',
        name: 'Housing',
        icon: '🏠',
        color: '#444444',
        parentId: null,
        categoryType: 'Outgoing',
        isArchived: false,
        description: null,
      },
      fromAccount: {
        id: 'acc-2',
        name: 'Savings',
        icon: '💰',
        color: '#222222',
        accountType: 'Savings',
        balance: 5000,
        balancePerDay: [],
        balanceChangeThisPeriod: 0,
        transactionCount: 0,
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
    });

    const { result } = renderHook(() => useCreateTransactionFromRequest(null), { wrapper });

    const payload: TransactionRequest = {
      description: 'Rent',
      amount: 100000,
      occurredAt: '2026-02-03',
      categoryId: 'cat-2',
      fromAccountId: 'acc-2',
      toAccountId: undefined,
      vendorId: undefined,
    };

    await result.current.mutateAsync(payload);

    expect(mockCreateTransactionFromRequest).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.transactions() });
  });

  it('invalidates transactions after update', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockUpdateTransaction.mockResolvedValue({
      id: 'tx-4',
      description: 'Updated',
      amount: 2000,
      occurredAt: '2026-02-04',
      category: {
        id: 'cat-3',
        name: 'Other',
        icon: '🧾',
        color: '#555555',
        parentId: null,
        categoryType: 'Outgoing',
        isArchived: false,
        description: null,
      },
      fromAccount: {
        id: 'acc-3',
        name: 'Wallet',
        icon: '👛',
        color: '#333333',
        accountType: 'Wallet',
        balance: 200,
        balancePerDay: [],
        balanceChangeThisPeriod: 0,
        transactionCount: 0,
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
    });

    const { result } = renderHook(() => useUpdateTransaction(null), { wrapper });

    const payload: TransactionRequest = {
      description: 'Updated',
      amount: 2000,
      occurredAt: '2026-02-04',
      categoryId: 'cat-3',
      fromAccountId: 'acc-3',
      toAccountId: undefined,
      vendorId: undefined,
    };

    await result.current.mutateAsync({ id: 'tx-4', data: payload });

    expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-4', payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.transactions() });
  });
});
