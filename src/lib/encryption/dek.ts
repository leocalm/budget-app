import { aesGcmDecryptRaw, aesGcmEncryptRaw } from './aesGcm';
import { DEFAULT_ARGON2_PARAMS, deriveKEK, type DekWrapParams } from './argon2';
import {
  base64Decode,
  base64Encode,
  DEK_LEN,
  NONCE_LEN,
  randomBytes,
  WRAP_SALT_LEN,
} from './encoding';

export interface WrappedDekMaterial {
  wrappedDekBase64: string;
  params: DekWrapParams;
}

// The wrapped-DEK blob is NOT stored in the standard envelope layout. iOS
// (and therefore the on-the-wire contract) stores the AES-GCM nonce
// separately inside `dek_wrap_params.wrapNonce`, and the `wrapped_dek`
// bytes contain only `ciphertext ‖ 16-byte GCM tag` (48 bytes for a
// 32-byte DEK). Keep the raw AES-GCM helpers here so both platforms can
// interop.

// Generates a fresh DEK and wraps it with a KEK derived from the user's
// password. Returns the 32-byte DEK (to be cached + sent to /auth/unlock) and
// the wrapped blob + params the server needs to persist.
export async function createWrappedDek(password: string): Promise<{
  dek: Uint8Array;
  wrapped: WrappedDekMaterial;
}> {
  const dek = randomBytes(DEK_LEN);
  const salt = randomBytes(WRAP_SALT_LEN);
  const wrapNonce = randomBytes(NONCE_LEN);
  const kek = await deriveKEK(password, salt);
  const body = await aesGcmEncryptRaw(kek, wrapNonce, dek);
  return {
    dek,
    wrapped: {
      wrappedDekBase64: base64Encode(body),
      params: {
        salt: base64Encode(salt),
        m: DEFAULT_ARGON2_PARAMS.memoryCostKiB,
        t: DEFAULT_ARGON2_PARAMS.timeCost,
        p: DEFAULT_ARGON2_PARAMS.parallelism,
        wrapNonce: base64Encode(wrapNonce),
      },
    },
  };
}

// Unwraps the server-stored wrapped DEK using the user's password and the
// derivation params returned by `GET /auth/wrapped-dek`.
export async function unwrapDek(
  password: string,
  wrappedDekBase64: string,
  params: DekWrapParams
): Promise<Uint8Array> {
  const salt = base64Decode(params.salt);
  const wrapNonce = base64Decode(params.wrapNonce);
  const kek = await deriveKEK(password, salt, { m: params.m, t: params.t, p: params.p });
  const body = base64Decode(wrappedDekBase64);
  const dek = await aesGcmDecryptRaw(kek, wrapNonce, body);
  if (dek.length !== DEK_LEN) {
    throw new Error(`unwrapped DEK has wrong length: ${dek.length}`);
  }
  return dek;
}

// Re-wraps an already-known DEK with a fresh KEK — used on password change.
export async function rewrapDek(password: string, dek: Uint8Array): Promise<WrappedDekMaterial> {
  if (dek.length !== DEK_LEN) {
    throw new Error(`DEK must be ${DEK_LEN} bytes`);
  }
  const salt = randomBytes(WRAP_SALT_LEN);
  const wrapNonce = randomBytes(NONCE_LEN);
  const kek = await deriveKEK(password, salt);
  const body = await aesGcmEncryptRaw(kek, wrapNonce, dek);
  return {
    wrappedDekBase64: base64Encode(body),
    params: {
      salt: base64Encode(salt),
      m: DEFAULT_ARGON2_PARAMS.memoryCostKiB,
      t: DEFAULT_ARGON2_PARAMS.timeCost,
      p: DEFAULT_ARGON2_PARAMS.parallelism,
      wrapNonce: base64Encode(wrapNonce),
    },
  };
}
