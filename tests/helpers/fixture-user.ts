import type { APIRequestContext } from 'playwright/test';
import { e2eEnv } from '../setup/env';
import { createUserViaApi } from './api-helpers';
import type { TestUserCredentials } from './test-data';

export async function createTestUserViaApi(
  request: APIRequestContext,
  credentials: TestUserCredentials
): Promise<void> {
  await createUserViaApi(request, e2eEnv.apiUrl, credentials, e2eEnv.registerEndpoints);
}
