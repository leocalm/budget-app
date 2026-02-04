import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetRequest, BudgetResponse } from '@/types/budget';
import { createBudget } from './budget';
import { apiPost } from './client';

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
});
