import { AccountRequest, AccountResponse } from '../types/account';
import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function fetchAccounts(): Promise<AccountResponse[]> {
  return apiGet<AccountResponse[]>('/api/accounts');
}

export async function fetchAccount(id: string): Promise<AccountResponse> {
  return apiGet<AccountResponse>(`/api/accounts/${id}`);
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
