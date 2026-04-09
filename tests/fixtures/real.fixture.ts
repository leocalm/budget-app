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
    await page.getByTestId('login-email').fill(realUser.email);
    await page.getByTestId('login-password').fill(realUser.password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);

    // Skip onboarding if redirected there
    if (page.url().includes('/onboarding')) {
      // Dismiss cookie banner first — it overlays the onboarding buttons
      await page
        .getByRole('region', { name: 'Cookie consent' })
        .getByRole('button', { name: 'Accept' })
        .click({ timeout: 3000 })
        .catch(() => {});
      await page.waitForTimeout(300);

      // Click through onboarding steps until we reach the dashboard.
      for (let i = 0; i < 10; i++) {
        if (!page.url().includes('/onboarding')) {
          break;
        }

        // Currency step: select Euro if the currency list is visible
        const euroOption = page.getByText('Euro', { exact: true });
        if (await euroOption.isVisible({ timeout: 500 }).catch(() => false)) {
          await euroOption.click();
        }

        // Try each button in priority order
        for (const testId of ['onboarding-go-to-dashboard', 'onboarding-skip', 'onboarding-next']) {
          const btn = page.getByTestId(testId);
          if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
            await btn.click();
            break;
          }
        }
        await page.waitForTimeout(500);
      }
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    }

    await use(page);
  },
});

export { expect };
