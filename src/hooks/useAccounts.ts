import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteAccount, fetchAccounts, updateAccount } from '@/api/account';
import { AccountRequest } from '@/types/account';
import { queryKeys } from './queryKeys';

export const useAccounts = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.accounts(selectedPeriodId),
    queryFn: () => fetchAccounts(selectedPeriodId),
    enabled: selectedPeriodId !== null,
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: async () => {
      await Promise.all([queryClient.refetchQueries({ queryKey: queryKeys.accounts() })]);
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountRequest }) =>
      updateAccount(id, payload),
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: queryKeys.accounts() })]);
    },
  });
};
