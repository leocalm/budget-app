import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { BudgetCategoryRequest, BudgetCategoryUpdateRequest } from '@/types/budget';
import { CategoryRequest } from '@/types/category';
import { queryKeys } from './queryKeys';

const CATEGORIES_PAGE_SIZE = 50;

export const useCategories = (selectedPeriodId: string | null) => {
  return useQuery({
    queryKey: queryKeys.categories(selectedPeriodId),
    queryFn: () => fetchCategories(selectedPeriodId),
    enabled: selectedPeriodId !== null,
  });
};

export const useInfiniteCategories = (selectedPeriodId: string | null) => {
  return useInfiniteQuery({
    queryKey: queryKeys.categoriesInfinite(selectedPeriodId, CATEGORIES_PAGE_SIZE),
    queryFn: ({ pageParam }) =>
      fetchCategoriesPage({
        selectedPeriodId,
        cursor: pageParam,
        pageSize: CATEGORIES_PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: selectedPeriodId !== null,
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetedCategories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unbudgetedCategories() });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newCategory: CategoryRequest) => createCategory(newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetedCategories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unbudgetedCategories() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryRequest }) =>
      updateCategory(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.budgetedCategories() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.unbudgetedCategories() }),
      ]);
    },
  });
};

export const useUnbudgetedCategories = () => {
  return useQuery({
    queryKey: queryKeys.unbudgetedCategories(),
    queryFn: fetchUnbudgetedCategories,
  });
};

export const useCreateBudgetCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetCategoryRequest) => createBudgetCategory(payload),
    onSuccess: async () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.unbudgetedCategories() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.budgetedCategories() }),
      ]);
    },
  });
};

export const useBudgetedCategories = () => {
  return useQuery({
    queryKey: queryKeys.budgetedCategories(),
    queryFn: fetchBudgetCategories,
  });
};

export const useDeleteBudgetCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudgetCategory(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.unbudgetedCategories() }),
        queryClient.refetchQueries({ queryKey: queryKeys.budgetedCategories() }),
      ]);
    },
  });
};

export const useUpdateBudgetCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BudgetCategoryUpdateRequest }) =>
      updateBudgetCategory(id, payload),
    onSuccess: async () => {
      await Promise.all([queryClient.refetchQueries({ queryKey: queryKeys.budgetedCategories() })]);
    },
  });
};
