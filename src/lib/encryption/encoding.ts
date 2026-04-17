// Low-level binary encoding helpers for the client-side crypto layer.
//
// The API's envelope format is `12-byte nonce ‖ ciphertext ‖ 16-byte GCM tag`
// (see docs/PHASE4B_WEB_HANDOVER.md). Every encrypted field on the wire is the
// base64 encoding of that envelope. Integer plaintexts (amounts, balances) are
// 8-byte little-endian i64. Strings are UTF-8.

export const NONCE_LEN = 12;
export const TAG_LEN = 16;
export const DEK_LEN = 32;
export const WRAP_SALT_LEN = 16;

export function base64Encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64Decode(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  crypto.getRandomValues(out);
  return out;
}

export function encodeI64LE(value: bigint | number): Uint8Array {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setBigInt64(0, typeof value === 'bigint' ? value : BigInt(value), true);
  return new Uint8Array(buf);
}

export function decodeI64LE(bytes: Uint8Array): bigint {
  if (bytes.length !== 8) {
    throw new Error(`decodeI64LE expected 8 bytes, got ${bytes.length}`);
  }
  return new DataView(bytes.buffer, bytes.byteOffset, 8).getBigInt64(0, true);
}

export function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

export function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}
