import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  createTransactionFromRequest,
  deleteTransaction,
  fetchTransactions,
  fetchTransactionsPage,
  updateTransaction,
  type TransactionFilterParams,
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

export const useInfiniteTransactions = (
  selectedPeriodId: string | null,
  filters?: TransactionFilterParams
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.transactionsInfinite(selectedPeriodId, TRANSACTIONS_PAGE_SIZE, filters),
    queryFn: ({ pageParam }) =>
      fetchTransactionsPage({
        selectedPeriodId,
        cursor: pageParam,
        pageSize: TRANSACTIONS_PAGE_SIZE,
        filters,
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['transactions', selectedPeriodId, 'infinite'],
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      // Invalidate dashboard data
      await queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetStability() });
      // Invalidate related entity lists
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};

export const useCreateTransaction = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTransaction: Transaction) => createTransaction(newTransaction),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['transactions', selectedPeriodId, 'infinite'],
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      // Invalidate dashboard data
      await queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetStability() });
      // Invalidate related entity lists
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};

export const useCreateTransactionFromRequest = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTransaction: TransactionRequest) =>
      createTransactionFromRequest(newTransaction),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['transactions', selectedPeriodId, 'infinite'],
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      // Invalidate dashboard data
      await queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetStability() });
      // Invalidate related entity lists
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};

export const useUpdateTransaction = (selectedPeriodId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionRequest }) =>
      updateTransaction(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['transactions', selectedPeriodId, 'infinite'],
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      // Invalidate dashboard data
      await queryClient.invalidateQueries({ queryKey: queryKeys.spentPerCategory() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthlyBurnIn() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthProgress() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetPerDay() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.recentTransactions() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgetStability() });
      // Invalidate related entity lists
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors() });
    },
  });
};
