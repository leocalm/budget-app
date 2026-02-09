import { test as base } from 'playwright/test';
import { createTestUserViaApi } from '../helpers/fixture-user';
import { MockApiServer } from '../helpers/mock-api';
import { createTestUserCredentials, type TestUserCredentials } from '../helpers/test-data';
import { e2eEnv, type ApiMode } from '../setup/env';

interface DatabaseFixtures {
  apiMode: ApiMode;
  mockApi: MockApiServer | null;
  registeredUser: TestUserCredentials;
}

export const test = base.extend<DatabaseFixtures>({
  apiMode: [e2eEnv.apiMode, { option: true }],

  mockApi: [
    async ({ apiMode, context }, use) => {
      if (apiMode !== 'mock') {
        await use(null);
        return;
      }

      const mockApi = new MockApiServer();
      await mockApi.install(context);
      await use(mockApi);
      await mockApi.uninstall(context);
    },
    { auto: true },
  ],

  registeredUser: async ({ apiMode, mockApi, request }, use, testInfo) => {
    const credentials = createTestUserCredentials(testInfo.title);

    if (apiMode === 'mock') {
      if (!mockApi) {
        throw new Error('Mock API is not initialized');
      }

      mockApi.createUser(credentials);
      await use(credentials);
      return;
    }

    await createTestUserViaApi(request, credentials);
    await use(credentials);
  },
});

export { expect } from 'playwright/test';
