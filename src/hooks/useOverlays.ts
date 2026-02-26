import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOverlay, deleteOverlay, fetchOverlays, updateOverlay } from '@/api/overlay';
import { Overlay, OverlayRequest } from '@/types/overlay';
import { queryKeys } from './queryKeys';

const isOverlayActive = (overlay: Overlay, now = dayjs().startOf('day')) => {
  const start = dayjs(overlay.startDate).startOf('day');
  const end = dayjs(overlay.endDate).startOf('day');

  return (start.isBefore(now) || start.isSame(now)) && (end.isAfter(now) || end.isSame(now));
};

export const useOverlays = () => {
  return useQuery({
    queryKey: queryKeys.overlays.list(),
    queryFn: fetchOverlays,
  });
};

export const useActiveOverlays = () => {
  return useQuery({
    queryKey: queryKeys.overlays.list(),
    queryFn: fetchOverlays,
    select: (overlays) => overlays.filter((overlay) => isOverlayActive(overlay)),
  });
};

export const useCreateOverlay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OverlayRequest) => createOverlay(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.overlays.list() });
    },
  });
};

export const useUpdateOverlay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OverlayRequest }) =>
      updateOverlay(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.overlays.list() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.overlays.detail(variables.id) });
    },
  });
};

export const useDeleteOverlay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOverlay(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.overlays.list() });
    },
  });
};
