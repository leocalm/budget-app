import { randomInt } from 'crypto';

export interface TestUserCredentials {
  name: string;
  email: string;
  password: string;
}

function normalizeToken(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

export function createTestUserCredentials(seed: string): TestUserCredentials {
  const safeSeed = normalizeToken(seed);
  const timestamp = Date.now();
  const randomSuffix = randomInt(0, 1_000_000).toString().padStart(6, '0');

  return {
    name: `E2E User ${safeSeed || 'test'}`,
    email: `e2e-${safeSeed || 'test'}-${timestamp}-${randomSuffix}@example.test`,
    password: `E2E-${timestamp}-${randomSuffix}-Pass!`,
  };
}
