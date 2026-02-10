import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAccount,
  deleteAccount,
  fetchAccounts,
  fetchAccountsPage,
  updateAccount,
} from '@/api/account';
import { AccountRequest } from '@/types/account';
import { queryKeys } from './queryKeys';

const ACCOUNTS_PAGE_SIZE = 50;

export const useAccounts = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.accounts(selectedPeriodId),
    queryFn: () => fetchAccounts(selectedPeriodId),
    enabled: selectedPeriodId !== null,
  });
};

export const useInfiniteAccounts = (selectedPeriodId: string | null) => {
  return useInfiniteQuery({
    queryKey: queryKeys.accountsInfinite(selectedPeriodId, ACCOUNTS_PAGE_SIZE),
    queryFn: ({ pageParam }) =>
      fetchAccountsPage({
        selectedPeriodId,
        cursor: pageParam,
        pageSize: ACCOUNTS_PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: selectedPeriodId !== null,
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.totalAssets() }),
      ]);
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AccountRequest) => createAccount(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.totalAssets() }),
      ]);
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountRequest }) =>
      updateAccount(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.totalAssets() }),
      ]);
    },
  });
};
