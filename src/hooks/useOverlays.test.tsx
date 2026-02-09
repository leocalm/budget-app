import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createOverlay,
  deleteOverlay,
  excludeOverlayTransaction,
  fetchOverlay,
  fetchOverlays,
  fetchOverlayTransactions,
  includeOverlayTransaction,
  updateOverlay,
} from '@/api/overlay';
import { queryKeys } from './queryKeys';
import {
  useCreateOverlay,
  useDeleteOverlay,
  useExcludeOverlayTransaction,
  useIncludeOverlayTransaction,
  useOverlay,
  useOverlays,
  useOverlayTransactions,
  useUpdateOverlay,
} from './useOverlays';

vi.mock('@/api/overlay', () => ({
  fetchOverlays: vi.fn(),
  fetchOverlay: vi.fn(),
  fetchOverlayTransactions: vi.fn(),
  createOverlay: vi.fn(),
  updateOverlay: vi.fn(),
  deleteOverlay: vi.fn(),
  includeOverlayTransaction: vi.fn(),
  excludeOverlayTransaction: vi.fn(),
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
    vi.mocked(fetchOverlay).mockReset();
    vi.mocked(fetchOverlayTransactions).mockReset();
    vi.mocked(createOverlay).mockReset();
    vi.mocked(updateOverlay).mockReset();
    vi.mocked(deleteOverlay).mockReset();
    vi.mocked(includeOverlayTransaction).mockReset();
    vi.mocked(excludeOverlayTransaction).mockReset();
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

  it('fetches overlay detail when id is provided', async () => {
    const { wrapper } = createWrapper();

    vi.mocked(fetchOverlay).mockResolvedValue({
      id: 'overlay-1',
      name: 'Italy Trip',
      startDate: '2026-08-10',
      endDate: '2026-08-20',
      inclusionMode: 'manual',
    });

    const { result } = renderHook(() => useOverlay('overlay-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchOverlay).toHaveBeenCalledWith('overlay-1');
  });

  it('fetches overlay transactions when id is provided', async () => {
    const { wrapper } = createWrapper();

    vi.mocked(fetchOverlayTransactions).mockResolvedValue([
      {
        id: 'tx-1',
        description: 'Flight',
        amount: 12000,
        occurredAt: '2026-08-11',
        category: {
          id: 'cat-1',
          name: 'Travel',
          color: '#00d4ff',
          icon: '✈️',
          categoryType: 'Outgoing',
        },
        fromAccount: { id: 'acc-1', name: 'Main', color: '#00d4ff', icon: '💳' },
        toAccount: null,
        vendor: null,
        membership: {
          isIncluded: true,
          inclusionSource: 'manual',
        },
      },
    ]);

    const { result } = renderHook(() => useOverlayTransactions('overlay-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchOverlayTransactions).toHaveBeenCalledWith('overlay-1');
  });

  it('invalidates overlay queries after including a transaction', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(includeOverlayTransaction).mockResolvedValue(undefined);

    const { result } = renderHook(() => useIncludeOverlayTransaction(), { wrapper });

    await result.current.mutateAsync({
      overlayId: 'overlay-1',
      transactionId: 'tx-1',
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.overlays.list() });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.overlays.detail('overlay-1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.overlays.transactions('overlay-1'),
    });
  });

  it('invalidates overlay queries after excluding a transaction', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(excludeOverlayTransaction).mockResolvedValue(undefined);

    const { result } = renderHook(() => useExcludeOverlayTransaction(), { wrapper });

    await result.current.mutateAsync({
      overlayId: 'overlay-1',
      transactionId: 'tx-1',
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.overlays.list() });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.overlays.detail('overlay-1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.overlays.transactions('overlay-1'),
    });
  });
});
