import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOverlay, deleteOverlay, fetchOverlays, updateOverlay } from '@/api/overlay';
import { queryKeys } from './queryKeys';
import { useCreateOverlay, useDeleteOverlay, useOverlays, useUpdateOverlay } from './useOverlays';

vi.mock('@/api/overlay', () => ({
  fetchOverlays: vi.fn(),
  createOverlay: vi.fn(),
  updateOverlay: vi.fn(),
  deleteOverlay: vi.fn(),
}));

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

describe('useOverlays hooks', () => {
  beforeEach(() => {
    vi.mocked(fetchOverlays).mockReset();
    vi.mocked(createOverlay).mockReset();
    vi.mocked(updateOverlay).mockReset();
    vi.mocked(deleteOverlay).mockReset();
  });

  it('fetches overlays list', async () => {
    const { wrapper } = createWrapper();
    vi.mocked(fetchOverlays).mockResolvedValue([
      {
        id: 'overlay-1',
        name: 'Italy Trip',
        startDate: '2026-08-10',
        endDate: '2026-08-20',
        inclusionMode: 'manual',
      },
    ]);

    const { result } = renderHook(() => useOverlays(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchOverlays).toHaveBeenCalledTimes(1);
  });

  it('invalidates overlays list when creating an overlay', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(createOverlay).mockResolvedValue({
      id: 'overlay-2',
      name: 'Holiday',
      startDate: '2026-12-01',
      endDate: '2026-12-25',
      inclusionMode: 'manual',
    });

    const { result } = renderHook(() => useCreateOverlay(), { wrapper });

    await result.current.mutateAsync({
      name: 'Holiday',
      startDate: '2026-12-01',
      endDate: '2026-12-25',
      inclusionMode: 'manual',
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.overlays.list() });
  });

  it('invalidates overlays list and detail when updating an overlay', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(updateOverlay).mockResolvedValue({
      id: 'overlay-1',
      name: 'Italy Trip Updated',
      startDate: '2026-08-10',
      endDate: '2026-08-20',
      inclusionMode: 'all',
    });

    const { result } = renderHook(() => useUpdateOverlay(), { wrapper });

    await result.current.mutateAsync({
      id: 'overlay-1',
      payload: {
        name: 'Italy Trip Updated',
        startDate: '2026-08-10',
        endDate: '2026-08-20',
        inclusionMode: 'all',
      },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.overlays.list() });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.overlays.detail('overlay-1'),
    });
  });

  it('invalidates overlays list when deleting an overlay', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(deleteOverlay).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteOverlay(), { wrapper });

    await result.current.mutateAsync('overlay-1');

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.overlays.list() });
  });
});
