import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetRequest, BudgetResponse } from '@/types/budget';
import {
  createBudget,
  createBudgetPeriodSchedule,
  fetchBudgetPeriodGaps,
  fetchBudgetPeriodSchedule,
  updateBudgetCategory,
  updateBudgetPeriod,
} from './budget';
import { apiGet, apiPost, apiPut } from './client';
import { ApiError } from './errors';

vi.mock('./client', () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe('budget api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a budget via /api/budgets', async () => {
    const payload: BudgetRequest = { name: 'Starter Budget', startDay: 1 };
    const response: BudgetResponse = {
      id: 'budget-1',
      name: 'Starter Budget',
      startDay: 1,
    };

    const apiPostMock = vi.mocked(apiPost);
    apiPostMock.mockResolvedValueOnce(response);

    await expect(createBudget(payload)).resolves.toEqual(response);
    expect(apiPostMock).toHaveBeenCalledWith('/api/budgets', payload);
  });

  it('updates a budget period by id', async () => {
    const response = {
      id: 'period-1',
      name: 'March 2026',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    };

    vi.mocked(apiPut).mockResolvedValueOnce(response);

    await expect(
      updateBudgetPeriod('period-1', {
        name: 'March 2026',
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      })
    ).resolves.toEqual(response);

    expect(apiPut).toHaveBeenCalledWith('/api/budget_period/period-1', {
      name: 'March 2026',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    });
  });

  it('returns null when schedule endpoint is not found', async () => {
    vi.mocked(apiGet).mockRejectedValueOnce(
      new ApiError('Not Found', 404, '/api/budget_period/schedule')
    );

    await expect(fetchBudgetPeriodSchedule()).resolves.toBeNull();
  });

  it('returns empty gaps when gaps endpoint is not found', async () => {
    vi.mocked(apiGet).mockRejectedValueOnce(
      new ApiError('Not Found', 404, '/api/budget_period/gaps')
    );

    await expect(fetchBudgetPeriodGaps()).resolves.toEqual({
      unassignedCount: 0,
      transactions: [],
    });
  });

  it('creates schedule via /api/budget_period/schedule', async () => {
    const payload = {
      startDay: 1,
      durationValue: 1,
      durationUnit: 'months' as const,
      saturdayAdjustment: 'keep' as const,
      sundayAdjustment: 'monday' as const,
      namePattern: '{MONTH} {YEAR}',
      generateAhead: 6,
    };

    vi.mocked(apiPost).mockResolvedValueOnce({ id: 'schedule-1', ...payload });

    await createBudgetPeriodSchedule(payload);

    expect(apiPost).toHaveBeenCalledWith('/api/budget_period/schedule', payload);
  });

  it('updates budget category with budgeted value payload', async () => {
    vi.mocked(apiPut).mockResolvedValueOnce(undefined);

    await updateBudgetCategory('budget-category-1', { budgetedValue: 9200 });

    expect(apiPut).toHaveBeenCalledWith('/api/budget-categories/budget-category-1', {
      budgetedValue: 9200,
    });
  });
});
