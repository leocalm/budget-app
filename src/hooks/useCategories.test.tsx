import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useCategories,
  useCreateBudgetCategory,
  useCreateCategory,
} from './useCategories';
import { queryKeys } from './queryKeys';
import { createBudgetCategory } from '@/api/budget';
import { createCategory, fetchCategories } from '@/api/category';
import type { BudgetCategoryRequest } from '@/types/budget';
import type { CategoryRequest } from '@/types/category';

vi.mock('@/api/budget', () => ({
  createBudgetCategory: vi.fn(),
}));

vi.mock('@/api/category', () => ({
  createCategory: vi.fn(),
  fetchCategories: vi.fn(),
}));

const mockCreateBudgetCategory = vi.mocked(createBudgetCategory);
const mockCreateCategory = vi.mocked(createCategory);
const mockFetchCategories = vi.mocked(fetchCategories);

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

describe('useCategories', () => {
  beforeEach(() => {
    mockCreateBudgetCategory.mockReset();
    mockCreateCategory.mockReset();
    mockFetchCategories.mockReset();
  });

  it('fetches categories', async () => {
    const { wrapper } = createWrapper();
    mockFetchCategories.mockResolvedValue([]);

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchCategories).toHaveBeenCalled();
  });

  it('invalidates categories after create', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockCreateCategory.mockResolvedValue({
      id: 'category-1',
      name: 'Food',
      color: '#000000',
      icon: '🍔',
      parentId: null,
      categoryType: 'Outgoing',
    });

    const { result } = renderHook(() => useCreateCategory(), { wrapper });

    const payload: CategoryRequest = {
      name: 'Food',
      color: '#000000',
      icon: '🍔',
      parentId: null,
      categoryType: 'Outgoing',
    };

    await result.current.mutateAsync(payload);

    expect(mockCreateCategory).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.categories() });
  });

  it('invalidates budgeted and unbudgeted categories after budget create', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockCreateBudgetCategory.mockResolvedValue({
      id: 'budget-category-1',
      categoryId: 'category-1',
      budgeted: 5000,
      spent: 0,
      available: 5000,
      category: {
        id: 'category-1',
        name: 'Food',
        color: '#000000',
        icon: '🍔',
        parentId: null,
        categoryType: 'Outgoing',
      },
    });

    const { result } = renderHook(() => useCreateBudgetCategory(), { wrapper });

    const payload: BudgetCategoryRequest = {
      categoryId: 'category-1',
      budgeted: 5000,
    };

    await result.current.mutateAsync(payload);

    expect(mockCreateBudgetCategory).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.unbudgetedCategories() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetedCategories() });
  });
});
