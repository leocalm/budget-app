import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDashboardCard,
  deleteDashboardCard,
  getAvailableCards,
  getDashboardLayout,
  reorderDashboardCards,
  resetDashboardLayout,
  updateDashboardCard,
} from '@/api/dashboardLayout';
import type {
  CreateDashboardCardRequest,
  DashboardCardConfig,
  ReorderRequest,
  UpdateDashboardCardRequest,
} from '@/types/dashboardLayout';
import { queryKeys } from './queryKeys';

export const useDashboardLayout = () => {
  return useQuery({
    queryKey: queryKeys.dashboardLayout(),
    queryFn: getDashboardLayout,
  });
};

export const useAvailableCards = () => {
  return useQuery({
    queryKey: queryKeys.availableCards(),
    queryFn: getAvailableCards,
  });
};

export const useCreateDashboardCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateDashboardCardRequest) => createDashboardCard(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardLayout() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.availableCards() });
    },
  });
};

export const useUpdateDashboardCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, request }: { cardId: string; request: UpdateDashboardCardRequest }) =>
      updateDashboardCard(cardId, request),
    onMutate: async ({ cardId, request }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.dashboardLayout() });
      const previous = queryClient.getQueryData<DashboardCardConfig[]>(queryKeys.dashboardLayout());
      if (previous) {
        queryClient.setQueryData<DashboardCardConfig[]>(
          queryKeys.dashboardLayout(),
          previous.map((card) => (card.id === cardId ? { ...card, ...request } : card))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.dashboardLayout(), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardLayout() });
    },
  });
};

export const useReorderDashboardCards = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ReorderRequest) => reorderDashboardCards(request),
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.dashboardLayout() });
      const previous = queryClient.getQueryData<DashboardCardConfig[]>(queryKeys.dashboardLayout());
      if (previous) {
        const positionMap = new Map(request.order.map((e) => [e.id, e.position]));
        queryClient.setQueryData<DashboardCardConfig[]>(
          queryKeys.dashboardLayout(),
          previous
            .map((card) => ({
              ...card,
              position: positionMap.get(card.id) ?? card.position,
            }))
            .sort((a, b) => a.position - b.position)
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.dashboardLayout(), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardLayout() });
    },
  });
};

export const useDeleteDashboardCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => deleteDashboardCard(cardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardLayout() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.availableCards() });
    },
  });
};

export const useResetDashboardLayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resetDashboardLayout(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardLayout() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.availableCards() });
    },
  });
};
