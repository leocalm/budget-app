import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteBudgetPeriodSchedule,
  fetchBudgetPeriodGaps,
  fetchBudgetPeriodSchedule,
  updateBudgetPeriod,
} from '@/api/budget';
import { queryKeys } from './queryKeys';
import {
  useBudgetPeriodGaps,
  useBudgetPeriodSchedule,
  useDeleteBudgetPeriodSchedule,
  useUpdateBudgetPeriod,
} from './useBudget';

vi.mock('@/api/budget', () => ({
  fetchBudget: vi.fn(),
  updateBudget: vi.fn(),
  fetchBudgetPeriods: vi.fn(),
  getCurrentBudgetPeriod: vi.fn(),
  createBudgetPeriod: vi.fn(),
  updateBudgetPeriod: vi.fn(),
  deleteBudgetPeriod: vi.fn(),
  fetchBudgetPeriodSchedule: vi.fn(),
  createBudgetPeriodSchedule: vi.fn(),
  updateBudgetPeriodSchedule: vi.fn(),
  deleteBudgetPeriodSchedule: vi.fn(),
  fetchBudgetPeriodGaps: vi.fn(),
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

describe('useBudget hooks', () => {
  beforeEach(() => {
    vi.mocked(updateBudgetPeriod).mockReset();
    vi.mocked(fetchBudgetPeriodSchedule).mockReset();
    vi.mocked(deleteBudgetPeriodSchedule).mockReset();
    vi.mocked(fetchBudgetPeriodGaps).mockReset();
  });

  it('fetches budget period schedule', async () => {
    const { wrapper } = createWrapper();
    vi.mocked(fetchBudgetPeriodSchedule).mockResolvedValue({
      id: 'schedule-1',
      startDay: 1,
      durationValue: 1,
      durationUnit: 'months',
      saturdayAdjustment: 'keep',
      sundayAdjustment: 'keep',
      namePattern: '{MONTH} {YEAR}',
      generateAhead: 6,
    });

    const { result } = renderHook(() => useBudgetPeriodSchedule(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchBudgetPeriodSchedule).toHaveBeenCalledTimes(1);
  });

  it('fetches budget period gaps', async () => {
    const { wrapper } = createWrapper();
    vi.mocked(fetchBudgetPeriodGaps).mockResolvedValue({
      unassignedCount: 2,
      transactions: [],
    });

    const { result } = renderHook(() => useBudgetPeriodGaps(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchBudgetPeriodGaps).toHaveBeenCalledTimes(1);
  });

  it('invalidates period queries after updating a period', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(updateBudgetPeriod).mockResolvedValue({
      id: 'period-1',
      name: 'Updated',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    });

    const { result } = renderHook(() => useUpdateBudgetPeriod(), { wrapper });

    await result.current.mutateAsync({
      id: 'period-1',
      payload: {
        name: 'Updated',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetPeriods.list() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetPeriods.current() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetPeriods.gaps() });
  });

  it('invalidates schedule and list when schedule is deleted', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(deleteBudgetPeriodSchedule).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteBudgetPeriodSchedule(), { wrapper });

    await result.current.mutateAsync();

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetPeriods.schedule() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetPeriods.list() });
  });
});
