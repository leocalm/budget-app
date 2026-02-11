import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createBudgetCategory,
  deleteBudgetCategory,
  fetchBudgetCategories,
  updateBudgetCategory,
} from '@/api/budget';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchCategoriesPage,
  fetchUnbudgetedCategories,
  updateCategory,
} from '@/api/category';
import type { BudgetCategoryRequest, BudgetCategoryUpdateRequest } from '@/types/budget';
import type { CategoryRequest } from '@/types/category';
import { queryKeys } from './queryKeys';
import {
  useBudgetedCategories,
  useCategories,
  useCreateBudgetCategory,
  useCreateCategory,
  useDeleteBudgetCategory,
  useDeleteCategory,
  useInfiniteCategories,
  useUnbudgetedCategories,
  useUpdateBudgetCategory,
  useUpdateCategory,
} from './useCategories';

vi.mock('@/api/budget', () => ({
  createBudgetCategory: vi.fn(),
  deleteBudgetCategory: vi.fn(),
  fetchBudgetCategories: vi.fn(),
  updateBudgetCategory: vi.fn(),
}));

vi.mock('@/api/category', () => ({
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  fetchCategories: vi.fn(),
  fetchCategoriesPage: vi.fn(),
  fetchUnbudgetedCategories: vi.fn(),
  updateCategory: vi.fn(),
}));

const mockCreateBudgetCategory = vi.mocked(createBudgetCategory);
const mockDeleteBudgetCategory = vi.mocked(deleteBudgetCategory);
const mockFetchBudgetCategories = vi.mocked(fetchBudgetCategories);
const mockUpdateBudgetCategory = vi.mocked(updateBudgetCategory);
const mockCreateCategory = vi.mocked(createCategory);
const mockDeleteCategory = vi.mocked(deleteCategory);
const mockFetchCategories = vi.mocked(fetchCategories);
const mockFetchCategoriesPage = vi.mocked(fetchCategoriesPage);
const mockFetchUnbudgeted = vi.mocked(fetchUnbudgetedCategories);
const mockUpdateCategory = vi.mocked(updateCategory);

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
    mockDeleteBudgetCategory.mockReset();
    mockFetchBudgetCategories.mockReset();
    mockUpdateBudgetCategory.mockReset();
    mockCreateCategory.mockReset();
    mockDeleteCategory.mockReset();
    mockFetchCategories.mockReset();
    mockFetchCategoriesPage.mockReset();
    mockFetchUnbudgeted.mockReset();
    mockUpdateCategory.mockReset();
  });

  it('fetches categories', async () => {
    const { wrapper } = createWrapper();
    mockFetchCategories.mockResolvedValue([]);

    const { result } = renderHook(() => useCategories('period-1'), { wrapper });

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

    const { result } = renderHook(() => useCreateCategory(null), { wrapper });

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

  it('invalidates categories after delete', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockDeleteCategory.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCategory(null), { wrapper });

    await result.current.mutateAsync('category-1');

    expect(mockDeleteCategory.mock.calls[0]?.[0]).toBe('category-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.categories() });
  });

  it('invalidates categories after update', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockUpdateCategory.mockResolvedValue({
      id: 'category-1',
      name: 'Food',
      color: '#000000',
      icon: '🍔',
      parentId: null,
      categoryType: 'Outgoing',
    });

    const { result } = renderHook(() => useUpdateCategory(null), { wrapper });

    const payload: CategoryRequest = {
      name: 'Food',
      color: '#000000',
      icon: '🍔',
      parentId: null,
      categoryType: 'Outgoing',
    };

    await result.current.mutateAsync({ id: 'category-1', payload });

    expect(mockUpdateCategory).toHaveBeenCalledWith('category-1', payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.categories() });
  });

  it('fetches unbudgeted categories', async () => {
    const { wrapper } = createWrapper();
    mockFetchUnbudgeted.mockResolvedValue([]);

    const { result } = renderHook(() => useUnbudgetedCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchUnbudgeted).toHaveBeenCalled();
  });

  it('invalidates budgeted and unbudgeted categories after budget create', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockCreateBudgetCategory.mockResolvedValue({
      id: 'budget-category-1',
      categoryId: 'category-1',
      budgetedValue: 5000,
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
      budgetedValue: 5000,
    };

    await result.current.mutateAsync(payload);

    expect(mockCreateBudgetCategory).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.unbudgetedCategories() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetedCategories() });
  });

  it('fetches budgeted categories', async () => {
    const { wrapper } = createWrapper();
    mockFetchBudgetCategories.mockResolvedValue([]);

    const { result } = renderHook(() => useBudgetedCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchBudgetCategories).toHaveBeenCalled();
  });

  it('refetches budgeted and unbudgeted categories after budget delete', async () => {
    const { wrapper, queryClient } = createWrapper();
    const refetchSpy = vi.spyOn(queryClient, 'refetchQueries');
    mockDeleteBudgetCategory.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteBudgetCategory(), { wrapper });

    await result.current.mutateAsync('budget-category-1');

    expect(mockDeleteBudgetCategory).toHaveBeenCalledWith('budget-category-1');
    expect(refetchSpy).toHaveBeenCalledWith({ queryKey: queryKeys.unbudgetedCategories() });
    expect(refetchSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetedCategories() });
  });

  it('refetches budgeted categories after budget update', async () => {
    const { wrapper, queryClient } = createWrapper();
    const refetchSpy = vi.spyOn(queryClient, 'refetchQueries');
    mockUpdateBudgetCategory.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateBudgetCategory(), { wrapper });

    const payload: BudgetCategoryUpdateRequest = {
      budgetedValue: 7500,
    };

    await result.current.mutateAsync({ id: 'budget-category-1', payload });

    expect(mockUpdateBudgetCategory).toHaveBeenCalledWith('budget-category-1', payload);
    expect(refetchSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetedCategories() });
  });

  it('does not fetch paginated categories when the period id is null', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useInfiniteCategories(null), { wrapper });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(mockFetchCategoriesPage).not.toHaveBeenCalled();
  });

  it('fetches paginated categories and loads the next page with cursor', async () => {
    const { wrapper } = createWrapper();

    mockFetchCategoriesPage
      .mockResolvedValueOnce({
        categories: [
          {
            id: 'category-1',
            name: 'Food',
            color: '#000000',
            icon: '🍔',
            parentId: null,
            categoryType: 'Outgoing',
            usedInPeriod: 10000,
            differenceVsAveragePercentage: 5,
            transactionCount: 10,
          },
        ],
        nextCursor: 'cursor-1',
      })
      .mockResolvedValueOnce({
        categories: [],
        nextCursor: null,
      });

    const { result } = renderHook(() => useInfiniteCategories('period-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchCategoriesPage).toHaveBeenNthCalledWith(1, {
      selectedPeriodId: 'period-1',
      cursor: null,
      pageSize: 50,
    });

    await result.current.fetchNextPage();

    await waitFor(() => {
      expect(mockFetchCategoriesPage).toHaveBeenCalledTimes(2);
    });

    expect(mockFetchCategoriesPage).toHaveBeenNthCalledWith(2, {
      selectedPeriodId: 'period-1',
      cursor: 'cursor-1',
      pageSize: 50,
    });
  });
});
