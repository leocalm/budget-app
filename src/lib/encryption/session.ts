import { base64Decode, base64Encode, DEK_LEN } from './encoding';

// Session-scoped cache for the plaintext DEK. Per Phase 4 guide the DEK lives
// in sessionStorage (cleared on tab close) — NOT localStorage.
const SESSION_STORAGE_KEY = 'piggy.dek';

// In-memory pointer so repeat reads don't round-trip through sessionStorage.
let cachedDek: Uint8Array | null = null;

// Subscribers that react to unlock/lock state changes (e.g. Encryption context).
type Listener = (hasDek: boolean) => void;
const listeners = new Set<Listener>();

function emit(hasDek: boolean) {
  for (const l of listeners) {
    l(hasDek);
  }
}

export function subscribeToDek(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function loadDekFromSessionStorage(): Uint8Array | null {
  if (cachedDek) {
    return cachedDek;
  }
  try {
    const encoded = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!encoded) {
      return null;
    }
    const bytes = base64Decode(encoded);
    if (bytes.length !== DEK_LEN) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    cachedDek = bytes;
    return bytes;
  } catch {
    return null;
  }
}

export function setDekInSession(dek: Uint8Array): void {
  if (dek.length !== DEK_LEN) {
    throw new Error(`setDekInSession: expected ${DEK_LEN} bytes, got ${dek.length}`);
  }
  cachedDek = dek;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, base64Encode(dek));
  } catch {
    // sessionStorage may be unavailable (e.g. SSR/tests) — in-memory cache
    // is still useful for the current page session.
  }
  emit(true);
}

export function clearDekFromSession(): void {
  cachedDek = null;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
  emit(false);
}

export function getDekOrThrow(): Uint8Array {
  const dek = loadDekFromSessionStorage();
  if (!dek) {
    throw new Error('DEK is not unlocked in this session');
  }
  return dek;
}

export function hasDek(): boolean {
  return !!loadDekFromSessionStorage();
}
