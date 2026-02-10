import {
  CategoriesPage,
  CategoryRequest,
  CategoryResponse,
  CategoryWithStats,
} from '@/types/category';
import { apiDelete, apiGet, apiGetRaw, apiPost, apiPut } from './client';

export async function fetchCategories(
  selectedPeriodId: string | null
): Promise<CategoryWithStats[]> {
  const query = selectedPeriodId ? `?period_id=${selectedPeriodId}` : '';
  return apiGet<CategoryWithStats[]>(`/api/categories${query}`);
}

export async function fetchUnbudgetedCategories(): Promise<CategoryResponse[]> {
  return apiGet<CategoryResponse[]>('/api/categories/not-in-budget');
}

export async function fetchCategory(id: string): Promise<CategoryRequest> {
  return apiGet<CategoryRequest>(`/api/categories/${id}`);
}

function toOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function parseCategoriesPageResponse(response: unknown): CategoriesPage {
  if (Array.isArray(response)) {
    return { categories: response as CategoryWithStats[], nextCursor: null };
  }

  if (!response || typeof response !== 'object') {
    return { categories: [], nextCursor: null };
  }

  const payload = response as Record<string, unknown>;
  const pagination =
    payload.pagination && typeof payload.pagination === 'object'
      ? (payload.pagination as Record<string, unknown>)
      : undefined;

  const nextCursor =
    toOptionalString(payload.nextCursor) ??
    toOptionalString(payload.cursor) ??
    toOptionalString(pagination?.nextCursor) ??
    toOptionalString(pagination?.cursor) ??
    null;

  const topLevelCategories =
    (Array.isArray(payload.categories) && (payload.categories as CategoryWithStats[])) ||
    (Array.isArray(payload.items) && (payload.items as CategoryWithStats[])) ||
    null;

  if (topLevelCategories) {
    return { categories: topLevelCategories, nextCursor };
  }

  const dataPayload =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : undefined;

  if (Array.isArray(dataPayload)) {
    return { categories: dataPayload as CategoryWithStats[], nextCursor };
  }

  if (dataPayload) {
    const nestedCategories =
      (Array.isArray(dataPayload.categories) && (dataPayload.categories as CategoryWithStats[])) ||
      (Array.isArray(dataPayload.items) && (dataPayload.items as CategoryWithStats[])) ||
      null;

    if (nestedCategories) {
      return {
        categories: nestedCategories,
        nextCursor: toOptionalString(dataPayload.nextCursor) ?? nextCursor,
      };
    }
  }

  return { categories: [], nextCursor };
}

export interface FetchCategoriesPageParams {
  selectedPeriodId: string | null;
  cursor?: string | null;
  pageSize?: number;
}

export async function fetchCategoriesPage({
  selectedPeriodId,
  cursor,
  pageSize = 50,
}: FetchCategoriesPageParams): Promise<CategoriesPage> {
  const searchParams = new URLSearchParams();
  if (selectedPeriodId) {
    searchParams.set('period_id', selectedPeriodId);
  }
  searchParams.set('page_size', String(pageSize));
  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  const query = searchParams.toString();
  const response = await apiGetRaw<unknown>(`/api/categories?${query}`);
  return parseCategoriesPageResponse(response);
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
