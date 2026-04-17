import { describe, expect, it } from 'vitest';
import { aesGcmDecryptEnvelope, aesGcmDecryptRaw, aesGcmEncryptEnvelope } from './aesGcm';
import { createWrappedDek, unwrapDek } from './dek';
import {
  base64Decode,
  base64Encode,
  decodeI64LE,
  decodeUtf8,
  encodeI64LE,
  encodeUtf8,
} from './encoding';
import { decryptI64Field, decryptStringField, encryptI64Field, encryptStringField } from './fields';

describe('encoding round-trips', () => {
  it('base64', () => {
    const raw = new Uint8Array([0, 1, 2, 3, 255, 254, 250]);
    expect(Array.from(base64Decode(base64Encode(raw)))).toEqual(Array.from(raw));
  });

  it('i64 little-endian', () => {
    const values = [0n, 1n, -1n, 10000n, -10000n, 1n << 62n, -(1n << 62n)];
    for (const v of values) {
      expect(decodeI64LE(encodeI64LE(v))).toBe(v);
    }
  });

  it('utf-8', () => {
    for (const s of ['', 'hello', 'héllo', '🐷💰', '中文']) {
      expect(decodeUtf8(encodeUtf8(s))).toBe(s);
    }
  });
});

describe('AES-GCM envelope', () => {
  it('encrypts and decrypts with the prefix-nonce envelope', async () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const plaintext = encodeUtf8('the quick brown piggy');
    const envelope = await aesGcmEncryptEnvelope(key, plaintext);
    const round = await aesGcmDecryptEnvelope(key, envelope);
    expect(Array.from(round)).toEqual(Array.from(plaintext));
  });

  it('decryptRaw matches envelope decrypt when nonce is split out', async () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const plaintext = encodeUtf8('wallet balance');
    const envelope = await aesGcmEncryptEnvelope(key, plaintext);
    const nonce = envelope.slice(0, 12);
    const body = envelope.slice(12);
    const round = await aesGcmDecryptRaw(key, nonce, body);
    expect(Array.from(round)).toEqual(Array.from(plaintext));
  });
});

describe('wrapped DEK', () => {
  it('round-trips under the same password', async () => {
    const password = 'SuperSecurePassword2024xyz';
    const { dek, wrapped } = await createWrappedDek(password);
    const unwrapped = await unwrapDek(password, wrapped.wrappedDekBase64, wrapped.params);
    expect(Array.from(unwrapped)).toEqual(Array.from(dek));
  });

  it('writes a wrapped blob of 48 bytes (32-byte DEK + 16-byte tag, no nonce prefix)', async () => {
    const { wrapped } = await createWrappedDek('anything');
    const bytes = base64Decode(wrapped.wrappedDekBase64);
    expect(bytes.length).toBe(48);
  });

  it('fails with a tampered password', async () => {
    const { wrapped } = await createWrappedDek('right');
    await expect(unwrapDek('wrong', wrapped.wrappedDekBase64, wrapped.params)).rejects.toThrow();
  });

  it('round-trips strings and i64 under the unwrapped DEK', async () => {
    const { dek } = await createWrappedDek('pw');
    const name = await encryptStringField(dek, 'Checking');
    expect(await decryptStringField(dek, name)).toBe('Checking');

    const balance = await encryptI64Field(dek, 123_45);
    expect(await decryptI64Field(dek, balance)).toBe(123_45n);
  });
});
