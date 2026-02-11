import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  createTransactionFromRequest,
  deleteTransaction,
  fetchTransactions,
  fetchTransactionsPage,
  updateTransaction,
} from '@/api/transaction';
import { Transaction, TransactionRequest } from '@/types/transaction';
import { queryKeys } from './queryKeys';

const TRANSACTIONS_PAGE_SIZE = 50;

export const useTransactions = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.transactions(selectedPeriodId),
    queryFn: () => fetchTransactions(selectedPeriodId),
    enabled: selectedPeriodId !== null,
  });
};

export const useInfiniteTransactions = (selectedPeriodId: string | null) => {
  return useInfiniteQuery({
    queryKey: queryKeys.transactionsInfinite(selectedPeriodId, TRANSACTIONS_PAGE_SIZE),
    queryFn: ({ pageParam }) =>
      fetchTransactionsPage({
        selectedPeriodId,
        cursor: pageParam,
        pageSize: TRANSACTIONS_PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: selectedPeriodId !== null,
  });
};

export const useDeleteTransaction = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactionsInfinite(selectedPeriodId, TRANSACTIONS_PAGE_SIZE),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      // Invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      // Invalidate related entity lists
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};

export const useCreateTransaction = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTransaction: Transaction) => createTransaction(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactionsInfinite(selectedPeriodId, TRANSACTIONS_PAGE_SIZE),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      // Invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      // Invalidate related entity lists
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};

export const useCreateTransactionFromRequest = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTransaction: TransactionRequest) =>
      createTransactionFromRequest(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactionsInfinite(selectedPeriodId, TRANSACTIONS_PAGE_SIZE),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      // Invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      // Invalidate related entity lists
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};

export const useUpdateTransaction = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionRequest }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactionsInfinite(selectedPeriodId, TRANSACTIONS_PAGE_SIZE),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      // Invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      // Invalidate related entity lists
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};
