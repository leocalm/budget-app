import { CategoryRequest, CategoryResponse } from '@/types/category';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

export async function fetchCategories(): Promise<CategoryResponse[]> {
  return apiGet<CategoryResponse[]>('/api/categories');
}

export async function fetchUnbudgetedCategories(): Promise<CategoryResponse[]> {
  return apiGet<CategoryResponse[]>('/api/categories/not-in-budget');
}

export async function fetchCategory(id: string): Promise<CategoryRequest> {
  return apiGet<CategoryRequest>(`/api/categories/${id}`);
}

export async function createCategory(payload: CategoryRequest): Promise<CategoryResponse> {
  return apiPost<CategoryResponse, CategoryRequest>('/api/categories', payload);
}

export async function deleteCategory(id: string): Promise<void> {
  return apiDelete(`/api/categories/${id}`);
}

export async function updateCategory(
  id: string,
  payload: CategoryRequest
): Promise<CategoryResponse> {
  return apiPut<CategoryResponse, CategoryRequest>(`/api/categories/${id}`, payload);
}
