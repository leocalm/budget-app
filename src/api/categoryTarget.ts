import { BatchUpsertTargetsRequest, CategoryTargetsResponse } from '@/types/categoryTarget';
import { apiGet, apiPost } from './client';

export async function fetchCategoryTargets(periodId: string): Promise<CategoryTargetsResponse> {
  return apiGet<CategoryTargetsResponse>(`/api/category-targets?period_id=${periodId}`);
}

export async function saveCategoryTargets(payload: BatchUpsertTargetsRequest): Promise<void> {
  return apiPost<void, BatchUpsertTargetsRequest>('/api/category-targets', payload);
}

export async function excludeCategoryFromTargets(categoryId: string): Promise<void> {
  return apiPost<void, undefined>(`/api/category-targets/${categoryId}/exclude`, undefined);
}

export async function includeCategoryInTargets(categoryId: string): Promise<void> {
  return apiPost<void, undefined>(`/api/category-targets/${categoryId}/include`, undefined);
}
