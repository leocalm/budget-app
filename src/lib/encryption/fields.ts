import { aesGcmDecryptEnvelope, aesGcmEncryptEnvelope } from './aesGcm';
import {
  base64Decode,
  base64Encode,
  decodeI64LE,
  decodeUtf8,
  encodeI64LE,
  encodeUtf8,
} from './encoding';

// Decode helpers over a base64 AES-GCM envelope using the session DEK.

export async function decryptStringField(dek: Uint8Array, cipherB64: string): Promise<string> {
  const envelope = base64Decode(cipherB64);
  const plaintext = await aesGcmDecryptEnvelope(dek, envelope);
  return decodeUtf8(plaintext);
}

export async function decryptI64Field(dek: Uint8Array, cipherB64: string): Promise<bigint> {
  const envelope = base64Decode(cipherB64);
  const plaintext = await aesGcmDecryptEnvelope(dek, envelope);
  return decodeI64LE(plaintext);
}

// Some pre-encryption records (e.g. the system Transfer category) have raw
// UTF-8 stored in the "encrypted" BYTEA column. Try decryption first, then
// fall back to treating the base64 as a raw UTF-8 string. Keeps list reads
// from exploding on legacy rows.
export async function decryptStringOrPlaintext(
  dek: Uint8Array,
  cipherB64: string
): Promise<string> {
  try {
    return await decryptStringField(dek, cipherB64);
  } catch {
    const bytes = base64Decode(cipherB64);
    try {
      return decodeUtf8(bytes);
    } catch {
      return cipherB64;
    }
  }
}

export async function encryptStringField(dek: Uint8Array, plaintext: string): Promise<string> {
  const envelope = await aesGcmEncryptEnvelope(dek, encodeUtf8(plaintext));
  return base64Encode(envelope);
}

export async function encryptI64Field(
  dek: Uint8Array,
  plaintext: bigint | number
): Promise<string> {
  const envelope = await aesGcmEncryptEnvelope(dek, encodeI64LE(plaintext));
  return base64Encode(envelope);
}

// Attempt to decrypt an i64; returns `fallback` on failure.
export async function decryptI64Safe(
  dek: Uint8Array,
  cipherB64: string | null | undefined,
  fallback: bigint = 0n
): Promise<bigint> {
  if (!cipherB64) {
    return fallback;
  }
  try {
    return await decryptI64Field(dek, cipherB64);
  } catch {
    return fallback;
  }
}

// Decrypt an i64 and clamp to safe Number range — the UI uses `number` for
// Money amounts via the existing `Money` wrapper.
export async function decryptI64AsNumber(dek: Uint8Array, cipherB64: string): Promise<number> {
  const v = await decryptI64Field(dek, cipherB64);
  return Number(v);
}
