import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetProvider, useBudgetPeriodSelection } from './BudgetContext';

const mockUseCurrentBudgetPeriod = vi.hoisted(() => vi.fn());
const mockUseBudgetPeriods = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useBudget', () => ({
  useCurrentBudgetPeriod: mockUseCurrentBudgetPeriod,
  useBudgetPeriods: mockUseBudgetPeriods,
}));

const periods = [
  {
    id: 'period-current',
    name: 'Current',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
  },
  {
    id: 'period-next',
    name: 'Next',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <BudgetProvider>{children}</BudgetProvider>
);

describe('BudgetContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseCurrentBudgetPeriod.mockReset();
    mockUseBudgetPeriods.mockReset();

    mockUseBudgetPeriods.mockReturnValue({
      data: periods,
      isFetched: true,
    });
    mockUseCurrentBudgetPeriod.mockReturnValue({
      data: periods[0],
    });
  });

  it('selects current period when none is selected', async () => {
    const { result } = renderHook(() => useBudgetPeriodSelection(), { wrapper });

    await waitFor(() => {
      expect(result.current.selectedPeriodId).toBe('period-current');
    });
  });

  it('replaces stale selected period with current period', async () => {
    localStorage.setItem('budget-period-id', JSON.stringify('stale-period'));

    const { result } = renderHook(() => useBudgetPeriodSelection(), { wrapper });

    await waitFor(() => {
      expect(result.current.selectedPeriodId).toBe('period-current');
    });
  });

  it('clears selected period when there are no periods', async () => {
    localStorage.setItem('budget-period-id', JSON.stringify('stale-period'));
    mockUseBudgetPeriods.mockReturnValue({ data: [], isFetched: true });
    mockUseCurrentBudgetPeriod.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useBudgetPeriodSelection(), { wrapper });

    await waitFor(() => {
      expect(result.current.selectedPeriodId).toBeNull();
    });
  });

  it('throws when hook is used outside provider', () => {
    expect(() => renderHook(() => useBudgetPeriodSelection())).toThrow(
      'useBudgetPeriodSelection must be used within a BudgetProvider'
    );
  });
});
