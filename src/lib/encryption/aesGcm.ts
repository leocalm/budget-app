import { concatBytes, NONCE_LEN, randomBytes, TAG_LEN } from './encoding';

// Imports a raw 32-byte AES key for one-shot encrypt/decrypt calls.
async function importAesKey(keyBytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', keyBytes as BufferSource, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

// Encrypts `plaintext` under the provided 32-byte key with a fresh random nonce.
// Returns the canonical envelope: 12-byte nonce ‖ ciphertext ‖ 16-byte GCM tag.
export async function aesGcmEncryptEnvelope(
  keyBytes: Uint8Array,
  plaintext: Uint8Array,
  nonce?: Uint8Array
): Promise<Uint8Array> {
  const iv = nonce ?? randomBytes(NONCE_LEN);
  if (iv.length !== NONCE_LEN) {
    throw new Error(`AES-GCM nonce must be ${NONCE_LEN} bytes, got ${iv.length}`);
  }
  const key = await importAesKey(keyBytes);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource, tagLength: TAG_LEN * 8 },
      key,
      plaintext as BufferSource
    )
  );
  return concatBytes(iv, ct);
}

// Inverse of `aesGcmEncryptEnvelope`. Validates the envelope has at least a
// 12-byte nonce and 16-byte tag, then returns the plaintext.
export async function aesGcmDecryptEnvelope(
  keyBytes: Uint8Array,
  envelope: Uint8Array
): Promise<Uint8Array> {
  if (envelope.length < NONCE_LEN + TAG_LEN) {
    throw new Error(`envelope too short (${envelope.length} bytes)`);
  }
  const iv = envelope.slice(0, NONCE_LEN);
  const body = envelope.slice(NONCE_LEN);
  const key = await importAesKey(keyBytes);
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource, tagLength: TAG_LEN * 8 },
    key,
    body as BufferSource
  );
  return new Uint8Array(pt);
}
