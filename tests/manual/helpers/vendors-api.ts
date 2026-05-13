import { expect, type APIRequestContext } from 'playwright/test';
import { e2eEnv } from '../../setup/env';

export interface CreateVendorApiOpts {
  name: string;
  description?: string;
}

export interface VendorSummary {
  id: string;
  name: string;
  status: string;
  description?: string | null;
}

export interface VendorDetail {
  id: string;
  name: string;
  periodSpend?: number;
  transactionCount?: number;
}

/**
 * Creates a vendor via the API proxy and returns its id.
 */
export async function createVendorViaApi(
  pageRequest: APIRequestContext,
  opts: CreateVendorApiOpts
): Promise<{ id: string }> {
  const res = await pageRequest.post(`${e2eEnv.baseUrl}/v2/vendors`, {
    data: {
      name: opts.name,
      ...(opts.description !== undefined ? { description: opts.description } : {}),
    },
  });

  if (!res.ok()) {
    throw new Error(`createVendorViaApi failed: ${res.status()} ${await res.text()}`);
  }

  const body = (await res.json()) as { id: string };
  return { id: body.id };
}

/**
 * Deletes a vendor via the API proxy.
 * Returns { ok, status, body } so tests can check for backend rejection
 * (e.g., vendors with transactions cannot be deleted).
 */
export async function deleteVendorViaApi(
  pageRequest: APIRequestContext,
  id: string
): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await pageRequest.delete(`${e2eEnv.baseUrl}/v2/vendors/${id}`);
  const body = await res.text();

  return {
    ok: res.ok(),
    status: res.status(),
    body,
  };
}

/**
 * Archives a vendor via the API proxy.
 */
export async function archiveVendorViaApi(
  pageRequest: APIRequestContext,
  id: string
): Promise<void> {
  const res = await pageRequest.post(`${e2eEnv.baseUrl}/v2/vendors/${id}/archive`);

  if (!res.ok()) {
    throw new Error(`archiveVendorViaApi failed: ${res.status()} ${await res.text()}`);
  }
}

/**
 * Returns all vendors for the current user.
 * Handles both plain-array and paginated `{ data: [] }` response shapes.
 */
export async function getVendorsViaApi(pageRequest: APIRequestContext): Promise<VendorSummary[]> {
  const res = await pageRequest.get(`${e2eEnv.baseUrl}/v2/vendors`);
  expect(res.ok(), `GET /v2/vendors failed: ${await res.text()}`).toBeTruthy();

  const body = await res.json();
  const items: VendorSummary[] = Array.isArray(body) ? body : (body.data ?? []);
  return items;
}

/**
 * Returns detailed information for a specific vendor.
 * Includes periodSpend and transactionCount if available.
 */
export async function getVendorDetailViaApi(
  pageRequest: APIRequestContext,
  id: string
): Promise<VendorDetail> {
  const res = await pageRequest.get(`${e2eEnv.baseUrl}/v2/vendors/${id}/detail`);

  if (!res.ok()) {
    throw new Error(`getVendorDetailViaApi failed: ${res.status()} ${await res.text()}`);
  }

  const body = (await res.json()) as VendorDetail;
  return body;
}
