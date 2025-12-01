import { CategoryRequest, CategoryResponse } from '@/types/category';

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const res = await fetch(`/api/categories`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  return res.json();
}

export async function fetchCategory(id: string): Promise<CategoryRequest> {
  const res = await fetch(`/api/categories/${id}`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Category not found');
  }
  return res.json();
}

export async function createCategory(payload: CategoryRequest): Promise<CategoryResponse> {
  const res = await fetch(`/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to create category');
  }
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to delete category');
  }
}
