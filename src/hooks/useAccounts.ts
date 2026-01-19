import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteAccount, fetchAccounts, updateAccount } from '@/api/account';
import { AccountRequest } from '@/types/account';

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'], // Unique key for caching
    queryFn: fetchAccounts,
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: async () => {
      await Promise.all([queryClient.refetchQueries({ queryKey: ['accounts'] })]);
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountRequest }) =>
      updateAccount(id, payload),
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['accounts'] })]);
    },
  });
};
