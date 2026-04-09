import { test as base, expect, type Page } from 'playwright/test';
import { createTestUserCredentials, type TestUserCredentials } from '../helpers/test-data';
import { RealOnboardingPage } from '../pages/real/onboarding.page';
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

    // Retry registration in case of rate limiting from parallel tests
    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }

      const response = await request.post(`${e2eEnv.apiUrl}/v2/auth/register`, {
        data: {
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
        },
      });

      if (response.ok()) {
        await use(credentials);
        return;
      }

      lastError = `${response.status()} ${await response.text()}`;
      if (response.status() === 409) {
        // Already registered (duplicate) — that's fine, use the credentials
        await use(credentials);
        return;
      }
    }

    throw new Error(`Failed to register real user after 3 attempts: ${lastError}`);
  },

  loggedInPage: async ({ page, realUser }, use) => {
    await page.goto('/auth/login');
    // Wait for login form to be ready
    await expect(page.getByTestId('login-email')).toBeVisible();
    // Dismiss cookie banner if visible (covers submit on mobile)
    await page
      .getByRole('region', { name: 'Cookie consent' })
      .getByRole('button', { name: 'Accept' })
      .click({ timeout: 2000 })
      .catch(() => {});
    await page.getByTestId('login-email').fill(realUser.email);
    await page.getByTestId('login-password').fill(realUser.password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);

    // Skip onboarding if redirected there
    if (page.url().includes('/onboarding')) {
      const onboarding = new RealOnboardingPage(page);
      await onboarding.skipToEnd();
      await onboarding.expectOnDashboard();
    }

    await use(page);
  },
});

export { expect };
