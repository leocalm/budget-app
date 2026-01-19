import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  createTransactionFromRequest,
  deleteTransaction,
  fetchTransactions,
} from '@/api/transaction';
import { Transaction, TransactionRequest } from '@/types/transaction';

export const useTransactions = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: ['transactions', selectedPeriodId],
    queryFn: () => fetchTransactions(selectedPeriodId),
    enabled: selectedPeriodId !== null,
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTransaction: Transaction) => createTransaction(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useCreateTransactionFromRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTransaction: TransactionRequest) =>
      createTransactionFromRequest(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
