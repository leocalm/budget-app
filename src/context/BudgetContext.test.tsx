import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetProvider, useBudgetPeriodSelection } from './BudgetContext';

const mockUseBudgetPeriods = vi.hoisted(() => vi.fn());
const mockUseAuth = vi.hoisted(() => vi.fn());
const mockApiClientPost = vi.hoisted(() => vi.fn().mockResolvedValue({}));

vi.mock('@/hooks/v2/useBudgetPeriods', () => ({
  useBudgetPeriods: mockUseBudgetPeriods,
}));

vi.mock('./AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('@/api/v2client', () => ({
  apiClient: { POST: mockApiClientPost },
}));

const periods = [
  {
    id: 'period-current',
    name: 'Current',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'active',
  },
  {
    id: 'period-next',
    name: 'Next',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'upcoming',
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <BudgetProvider>{children}</BudgetProvider>
);

describe('BudgetContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseBudgetPeriods.mockReset();
    mockUseAuth.mockReturnValue({ user: { onboardingStatus: 'completed' } });

    mockUseBudgetPeriods.mockReturnValue({
      data: { data: periods },
      isFetched: true,
      refetch: vi.fn(),
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
    mockUseBudgetPeriods.mockReturnValue({
      data: { data: [] },
      isFetched: true,
      refetch: vi.fn(),
    });

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
