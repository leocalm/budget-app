import { AccountRequest, AccountResponse, AccountsPage } from '@/types/account';
import { apiDelete, apiGet, apiGetRaw, apiPost, apiPut } from './client';

export async function fetchAccounts(selectedPeriodId: string | null): Promise<AccountResponse[]> {
  const query = selectedPeriodId ? `?period_id=${selectedPeriodId}` : '';
  return apiGet<AccountResponse[]>(`/api/accounts${query}`);
}

export async function fetchAccount(id: string): Promise<AccountResponse> {
  return apiGet<AccountResponse>(`/api/accounts/${id}`);
}

function toOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function parseAccountsPageResponse(response: unknown): AccountsPage {
  if (Array.isArray(response)) {
    return { accounts: response as AccountResponse[], nextCursor: null };
  }

  if (!response || typeof response !== 'object') {
    return { accounts: [], nextCursor: null };
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

  const topLevelAccounts =
    (Array.isArray(payload.accounts) && (payload.accounts as AccountResponse[])) ||
    (Array.isArray(payload.items) && (payload.items as AccountResponse[])) ||
    null;

  if (topLevelAccounts) {
    return { accounts: topLevelAccounts, nextCursor };
  }

  const dataPayload =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : undefined;

  if (Array.isArray(dataPayload)) {
    return { accounts: dataPayload as AccountResponse[], nextCursor };
  }

  if (dataPayload) {
    const nestedAccounts =
      (Array.isArray(dataPayload.accounts) && (dataPayload.accounts as AccountResponse[])) ||
      (Array.isArray(dataPayload.items) && (dataPayload.items as AccountResponse[])) ||
      null;

    if (nestedAccounts) {
      return {
        accounts: nestedAccounts,
        nextCursor: toOptionalString(dataPayload.nextCursor) ?? nextCursor,
      };
    }
  }

  return { accounts: [], nextCursor };
}

export interface FetchAccountsPageParams {
  selectedPeriodId: string | null;
  cursor?: string | null;
  pageSize?: number;
}

export async function fetchAccountsPage({
  selectedPeriodId,
  cursor,
  pageSize = 50,
}: FetchAccountsPageParams): Promise<AccountsPage> {
  const searchParams = new URLSearchParams();
  if (selectedPeriodId) {
    searchParams.set('period_id', selectedPeriodId);
  }
  searchParams.set('page_size', String(pageSize));
  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  const query = searchParams.toString();
  const response = await apiGetRaw<unknown>(`/api/accounts?${query}`);
  return parseAccountsPageResponse(response);
}

export async function createAccount(payload: AccountRequest): Promise<AccountResponse> {
  return apiPost<AccountResponse, AccountRequest>('/api/accounts', payload);
}

export async function deleteAccount(id: string): Promise<void> {
  return apiDelete(`/api/accounts/${id}`);
}

export async function updateAccount(id: string, payload: AccountRequest): Promise<AccountResponse> {
  return apiPut<AccountResponse, AccountRequest>(`/api/accounts/${id}`, payload);
}
