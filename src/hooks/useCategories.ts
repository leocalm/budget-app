import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  fetchUnbudgetedCategories,
  updateCategory,
} from '@/api/category';
import { BudgetCategoryRequest } from '@/types/budget';
import { CategoryRequest } from '@/types/category';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'], // Unique key for caching
    queryFn: fetchCategories,
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newCategory: CategoryRequest) => createCategory(newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryRequest }) =>
      updateCategory(id, payload),
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['categories'] })]);
    },
  });
};

export const useUnbudgetedCategories = () => {
  return useQuery({
    queryKey: ['unbudgetedCategories'],
    queryFn: fetchUnbudgetedCategories,
  });
};

export const useCreateBudgetCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetCategoryRequest) => createBudgetCategory(payload),
    onSuccess: async () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ['unbudgetedCategories'] }),
        queryClient.invalidateQueries({ queryKey: ['budgetedCategories'] }),
      ]);
    },
  });
};

export const useBudgetedCategories = () => {
  return useQuery({
    queryKey: ['budgetedCategories'],
    queryFn: fetchBudgetCategories,
  });
};

export const useDeleteBudgetCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudgetCategory(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['unbudgetedCategories'] }),
        queryClient.refetchQueries({ queryKey: ['budgetedCategories'] }),
      ]);
    },
  });
};

export const useUpdateBudgetCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: number }) =>
      updateBudgetCategory(id, payload),
    onSuccess: async () => {
      await Promise.all([queryClient.refetchQueries({ queryKey: ['budgetedCategories'] })]);
    },
  });
};
