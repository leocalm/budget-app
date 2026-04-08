import { test as base, expect, type Page } from 'playwright/test';
import { createTestUserCredentials, type TestUserCredentials } from '../helpers/test-data';
import { e2eEnv } from '../setup/env';

interface RealFixtures {
  realUser: TestUserCredentials;
  loggedInPage: Page;
}

/**
 * Fixtures for real-mode E2E tests.
 * - `realUser` registers a unique user via direct API call
 * - `loggedInPage` registers + logs in via the UI, returns authenticated Page
 */
export const test = base.extend<RealFixtures>({
  realUser: async ({ request }, use, testInfo) => {
    const credentials = createTestUserCredentials(testInfo.title);

    const response = await request.post(`${e2eEnv.apiUrl}/v2/auth/register`, {
      data: {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to register real user: ${response.status()} ${body}`);
    }

    await use(credentials);
  },

  loggedInPage: async ({ page, realUser }, use) => {
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill(realUser.email);
    await page.getByLabel('Password').fill(realUser.password);
    await page.getByLabel('Log in').click();
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
    await use(page);
  },
});

export { expect };
