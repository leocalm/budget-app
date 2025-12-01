// src/api/accounts.ts
import { AccountRequest, AccountResponse } from '../types/account';

export async function fetchAccounts(): Promise<AccountResponse[]> {
  const res = await fetch(`/api/accounts`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to fetch accounts');
  }
  return res.json();
}

export async function fetchAccount(id: string): Promise<AccountResponse> {
  const res = await fetch(`/api/accounts/${id}`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Account not found');
  }
  return res.json();
}

export async function createAccount(payload: AccountRequest): Promise<AccountResponse> {
  const res = await fetch(`/api/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to create account');
  }
  return res.json();
}

export async function deleteAccount(id: string): Promise<void> {
  const res = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to delete account');
  }
}
