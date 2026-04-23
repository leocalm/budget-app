import { argon2id } from 'hash-wasm';

export const DEFAULT_ARGON2_PARAMS = Object.freeze({
  memoryCostKiB: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
  keyLength: 32,
});

// The JSON shape stored on the server is whatever the client uploaded
// during registration/key-rotation. iOS serialises Swift's `DekWrapParams`
// with the default Codable strategy, so keys land as camelCase on the
// wire. The web client needs to match that exactly (no snake_case aliases)
// so accounts registered on one platform can unlock on the other.
export interface DekWrapParams {
  salt: string; // base64 16-byte random
  m: number; // memory cost in KiB
  t: number; // time cost (iterations)
  p: number; // parallelism lanes
  wrapNonce: string; // base64 12-byte nonce used to AES-GCM-wrap the DEK
}

export function isDekWrapParams(value: unknown): value is DekWrapParams {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.salt === 'string' &&
    typeof v.m === 'number' &&
    typeof v.t === 'number' &&
    typeof v.p === 'number' &&
    typeof v.wrapNonce === 'string'
  );
}

// Derives a 32-byte KEK from the user's password using Argon2id with the
// parameters the server stored alongside the wrapped DEK.
export async function deriveKEK(
  password: string,
  salt: Uint8Array,
  params: { m: number; t: number; p: number } = {
    m: DEFAULT_ARGON2_PARAMS.memoryCostKiB,
    t: DEFAULT_ARGON2_PARAMS.timeCost,
    p: DEFAULT_ARGON2_PARAMS.parallelism,
  }
): Promise<Uint8Array> {
  const hex = await argon2id({
    password,
    salt,
    parallelism: params.p,
    iterations: params.t,
    memorySize: params.m,
    hashLength: DEFAULT_ARGON2_PARAMS.keyLength,
    outputType: 'hex',
  });
  const out = new Uint8Array(DEFAULT_ARGON2_PARAMS.keyLength);
  for (let i = 0; i < DEFAULT_ARGON2_PARAMS.keyLength; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
