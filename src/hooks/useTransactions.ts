import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  createTransactionFromRequest,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from '@/api/transaction';
import { Transaction, TransactionRequest } from '@/types/transaction';
import { queryKeys } from './queryKeys';

export const useTransactions = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.transactions(selectedPeriodId),
    queryFn: () => fetchTransactions(selectedPeriodId),
    enabled: selectedPeriodId !== null,
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTransaction: Transaction) => createTransaction(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
};

export const useCreateTransactionFromRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTransaction: TransactionRequest) =>
      createTransactionFromRequest(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionRequest }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
};
