import { Vendor, VendorInput, VendorsPage, VendorWithStats } from '@/types/vendor';
import { apiDelete, apiGet, apiGetRaw, apiPatch, apiPost, apiPut } from './client';

export async function fetchVendors(periodId?: string | null): Promise<VendorWithStats[]> {
  const url = periodId ? `/api/vendors?period_id=${encodeURIComponent(periodId)}` : '/api/vendors';
  return apiGet<VendorWithStats[]>(url);
}

function toOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function parseVendorsPageResponse(response: unknown): VendorsPage {
  if (Array.isArray(response)) {
    return { items: response as VendorWithStats[], nextCursor: null };
  }

  if (!response || typeof response !== 'object') {
    return { items: [], nextCursor: null };
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

  const topLevelVendors =
    (Array.isArray(payload.vendors) && (payload.vendors as VendorWithStats[])) ||
    (Array.isArray(payload.items) && (payload.items as VendorWithStats[])) ||
    null;

  if (topLevelVendors) {
    return { items: topLevelVendors, nextCursor };
  }

  const dataPayload =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : undefined;

  if (Array.isArray(dataPayload)) {
    return { items: dataPayload as VendorWithStats[], nextCursor };
  }

  if (dataPayload) {
    const nestedVendors =
      (Array.isArray(dataPayload.vendors) && (dataPayload.vendors as VendorWithStats[])) ||
      (Array.isArray(dataPayload.items) && (dataPayload.items as VendorWithStats[])) ||
      null;

    if (nestedVendors) {
      return {
        items: nestedVendors,
        nextCursor: toOptionalString(dataPayload.nextCursor) ?? nextCursor,
      };
    }
  }

  return { items: [], nextCursor };
}

export interface FetchVendorsPageParams {
  periodId?: string | null;
  cursor?: string | null;
  pageSize?: number;
}

export async function fetchVendorsPage({
  periodId,
  cursor,
  pageSize = 50,
}: FetchVendorsPageParams): Promise<VendorsPage> {
  const searchParams = new URLSearchParams();
  if (periodId) {
    searchParams.set('period_id', periodId);
  }
  searchParams.set('page_size', String(pageSize));
  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  const query = searchParams.toString();
  const response = await apiGetRaw<unknown>(`/api/vendors?${query}`);
  return parseVendorsPageResponse(response);
}

export async function createVendor(payload: VendorInput): Promise<Vendor> {
  return apiPost<Vendor, VendorInput>('/api/vendors', payload);
}

export async function updateVendor(id: string, payload: VendorInput): Promise<Vendor> {
  return apiPut<Vendor, VendorInput>(`/api/vendors/${id}`, payload);
}

export async function deleteVendor(id: string): Promise<void> {
  return apiDelete(`/api/vendors/${id}`);
}

export async function fetchArchivedVendors(): Promise<VendorWithStats[]> {
  return apiGet<VendorWithStats[]>('/api/vendors/with_status?order_by=name&archived=true');
}

export async function archiveVendor(id: string): Promise<Vendor> {
  return apiPatch<Vendor>(`/api/vendors/${id}/archive`);
}

export async function restoreVendor(id: string): Promise<Vendor> {
  return apiPatch<Vendor>(`/api/vendors/${id}/restore`);
}
