import { test as base, expect, type Page } from 'playwright/test';
import { createTestUserCredentials, type TestUserCredentials } from '../../helpers/test-data';
import { e2eEnv } from '../../setup/env';

/**
 * Manual E2E fixture — real API only.
 *
 * Provides:
 * - `registeredUser`: creates a user via direct API call with retry for rate limiting
 * - `loggedInPage`: navigates to login, authenticates, skips onboarding, returns authenticated Page
 *
 * No mock mode. Tests using this fixture require a running backend.
 */
interface ManualFixtures {
  registeredUser: TestUserCredentials;
  loggedInPage: Page;
}

export const test = base.extend<ManualFixtures>({
  registeredUser: async ({ request }, use, testInfo) => {
    const credentials = createTestUserCredentials(testInfo.title);

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

      if (response.ok() || response.status() === 409) {
        await use(credentials);
        return;
      }

      const body = await response.text();
      // eslint-disable-next-line no-console
      console.error(`Registration attempt ${attempt + 1} failed: ${response.status()} ${body}`);
    }

    throw new Error(`Failed to register manual test user after 3 attempts: ${credentials.email}`);
  },

  loggedInPage: async ({ page, registeredUser }, use) => {
    await page.goto('/auth/login');

    await page
      .getByRole('region', { name: 'Cookie consent' })
      .getByRole('button', { name: 'Accept' })
      .click({ timeout: 2000 })
      .catch(() => {});

    await page.getByTestId('login-email').fill(registeredUser.email);
    await page.getByTestId('login-password').fill(registeredUser.password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 });

    if (page.url().includes('/onboarding')) {
      for (let i = 0; i < 15; i++) {
        if (!page.url().includes('/onboarding')) {
          break;
        }

        for (const testId of ['onboarding-go-to-dashboard', 'onboarding-skip', 'onboarding-next']) {
          const btn = page.getByTestId(testId);
          const visible = await btn.isVisible({ timeout: 1000 }).catch(() => {
            return false;
          });
          if (visible) {
            await btn.click();
            await page.waitForTimeout(500);
            break;
          }
        }
      }
    }

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await use(page);
  },
});

export { expect };
