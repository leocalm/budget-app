import { v2BaseUrl } from '@/api/v2client';
import type { DekWrapParams } from './argon2';
import { createWrappedDek, rewrapDek, unwrapDek } from './dek';
import { base64Encode } from './encoding';
import { clearDekFromSession, setDekInSession } from './session';

// Sends the plaintext DEK to the API so server-side encryption can proceed
// for the current session. The OpenAPI types don't cover this endpoint yet,
// so we use fetch directly against the v2 base URL.
export async function postUnlock(dek: Uint8Array): Promise<void> {
  const response = await fetch(`${v2BaseUrl}/auth/unlock`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dek: base64Encode(dek) }),
  });
  if (!response.ok) {
    throw new Error(`POST /auth/unlock failed with ${response.status}`);
  }
}

export interface WrappedDekFetchResult {
  wrappedDek: string | null;
  dekWrapParams: DekWrapParams | null;
}

export async function fetchWrappedDek(): Promise<WrappedDekFetchResult> {
  const response = await fetch(`${v2BaseUrl}/auth/wrapped-dek`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`GET /auth/wrapped-dek failed with ${response.status}`);
  }
  const body = (await response.json()) as {
    wrappedDek: string | null;
    dekWrapParams: DekWrapParams | null;
  };
  return { wrappedDek: body.wrappedDek ?? null, dekWrapParams: body.dekWrapParams ?? null };
}

export async function putWrappedDek(wrappedDek: string, params: DekWrapParams): Promise<void> {
  const response = await fetch(`${v2BaseUrl}/auth/wrapped-dek`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wrappedDek, dekWrapParams: params }),
  });
  if (!response.ok) {
    throw new Error(`PUT /auth/wrapped-dek failed with ${response.status}`);
  }
}

// Post-login / post-unlock-page orchestration. Fetches the wrapped DEK; if
// the user has none (first login under encryption) we generate one and PUT it
// back. Then we derive KEK, unwrap DEK, POST /auth/unlock, and cache the DEK
// for the current tab session.
export async function unlockWithPassword(password: string): Promise<Uint8Array> {
  let wrapped: WrappedDekFetchResult;
  try {
    wrapped = await fetchWrappedDek();
  } catch (err) {
    throw new Error(`unlock.fetchWrappedDek: ${(err as Error).message ?? err}`, { cause: err });
  }

  let dek: Uint8Array;
  if (!wrapped.wrappedDek || !wrapped.dekWrapParams) {
    try {
      const created = await createWrappedDek(password);
      await putWrappedDek(created.wrapped.wrappedDekBase64, created.wrapped.params);
      dek = created.dek;
    } catch (err) {
      throw new Error(`unlock.createWrappedDek: ${(err as Error).message ?? err}`, { cause: err });
    }
  } else {
    try {
      dek = await unwrapDek(password, wrapped.wrappedDek, wrapped.dekWrapParams);
    } catch (err) {
      throw new Error(
        `unlock.unwrapDek: ${(err as Error).message ?? err} (wrappedDekBytes=${wrapped.wrappedDek.length}, params=${JSON.stringify(wrapped.dekWrapParams)})`,
        { cause: err }
      );
    }
  }

  try {
    await postUnlock(dek);
  } catch (err) {
    throw new Error(`unlock.postUnlock: ${(err as Error).message ?? err}`, { cause: err });
  }
  setDekInSession(dek);
  return dek;
}

// Re-upload the wrapped DEK under a new password. The caller must already
// know the plaintext DEK (e.g. from sessionStorage).
export async function rotateWrappedDek(newPassword: string, dek: Uint8Array): Promise<void> {
  const wrapped = await rewrapDek(newPassword, dek);
  await putWrappedDek(wrapped.wrappedDekBase64, wrapped.params);
}

// Called after logout to make sure the next login starts cleanly.
export function lockSession(): void {
  clearDekFromSession();
}
