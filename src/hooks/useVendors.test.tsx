import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createVendor,
  deleteVendor,
  fetchVendors,
  fetchVendorsPage,
  updateVendor,
} from '@/api/vendor';
import type { VendorInput, VendorWithStats } from '@/types/vendor';
import { queryKeys } from './queryKeys';
import {
  useCreateVendor,
  useDeleteVendor,
  useInfiniteVendors,
  useUpdateVendor,
  useVendors,
} from './useVendors';

vi.mock('@/api/vendor', () => ({
  createVendor: vi.fn(),
  deleteVendor: vi.fn(),
  fetchVendors: vi.fn(),
  fetchVendorsPage: vi.fn(),
  updateVendor: vi.fn(),
}));

const mockCreateVendor = vi.mocked(createVendor);
const mockDeleteVendor = vi.mocked(deleteVendor);
const mockFetchVendors = vi.mocked(fetchVendors);
const mockFetchVendorsPage = vi.mocked(fetchVendorsPage);
const mockUpdateVendor = vi.mocked(updateVendor);

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

describe('useVendors', () => {
  beforeEach(() => {
    mockFetchVendors.mockReset();
    mockCreateVendor.mockReset();
    mockDeleteVendor.mockReset();
    mockUpdateVendor.mockReset();
    mockFetchVendorsPage.mockReset();
  });

  it('does not fetch when the period id is null', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useVendors(null), { wrapper });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockFetchVendors).not.toHaveBeenCalled();
  });

  it('fetches vendors when a period id is provided', async () => {
    const { wrapper } = createWrapper();
    const response: VendorWithStats[] = [
      { id: 'ven-1', name: 'Shop 1', transactionCount: 5, lastUsedAt: '2025-01-01' },
    ];

    mockFetchVendors.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useVendors('period-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchVendors).toHaveBeenCalledWith('period-1');
    expect(result.current.data).toEqual(response);
  });

  it('does not fetch paginated vendors when the period id is null', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useInfiniteVendors(null), { wrapper });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockFetchVendorsPage).not.toHaveBeenCalled();
  });

  it('fetches paginated vendors and loads the next page with cursor', async () => {
    const { wrapper } = createWrapper();

    mockFetchVendorsPage
      .mockResolvedValueOnce({
        items: [{ id: 'ven-1', name: 'Shop 1', transactionCount: 5 }],
        nextCursor: 'cursor-1',
      })
      .mockResolvedValueOnce({
        items: [{ id: 'ven-2', name: 'Shop 2', transactionCount: 3 }],
        nextCursor: null,
      });

    const { result } = renderHook(() => useInfiniteVendors('period-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchVendorsPage).toHaveBeenNthCalledWith(1, {
      periodId: 'period-1',
      cursor: null,
      pageSize: 50,
    });

    await result.current.fetchNextPage();

    await waitFor(() => {
      expect(mockFetchVendorsPage).toHaveBeenCalledTimes(2);
    });

    expect(mockFetchVendorsPage).toHaveBeenNthCalledWith(2, {
      periodId: 'period-1',
      cursor: 'cursor-1',
      pageSize: 50,
    });
  });

  it('invalidates vendors after delete', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockDeleteVendor.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteVendor(), { wrapper });

    await result.current.mutateAsync('ven-1');

    expect(mockDeleteVendor.mock.calls[0]?.[0]).toBe('ven-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.vendorsRoot() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.vendorsInfinite() });
  });

  it('invalidates vendors after create', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockCreateVendor.mockResolvedValue({
      id: 'ven-2',
      name: 'New Shop',
    });

    const { result } = renderHook(() => useCreateVendor(), { wrapper });

    const payload: VendorInput = { name: 'New Shop' };
    await result.current.mutateAsync(payload);

    expect(mockCreateVendor).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.vendorsRoot() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.vendorsInfinite() });
  });

  it('invalidates vendors after update', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockUpdateVendor.mockResolvedValue({
      id: 'ven-1',
      name: 'Updated Shop',
    });

    const { result } = renderHook(() => useUpdateVendor(), { wrapper });

    const payload: VendorInput = { name: 'Updated Shop' };
    await result.current.mutateAsync({ id: 'ven-1', data: payload });

    expect(mockUpdateVendor).toHaveBeenCalledWith('ven-1', payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.vendorsRoot() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.vendorsInfinite() });
  });
});
