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
      // Dismiss cookie banner first — it overlays the onboarding buttons
      await page
        .getByRole('region', { name: 'Cookie consent' })
        .getByRole('button', { name: 'Accept' })
        .click({ timeout: 3000 })
        .catch(() => {});
      await page.waitForTimeout(300);

      // Click through onboarding steps until we reach the dashboard.
      for (let i = 0; i < 15; i++) {
        if (!page.url().includes('/onboarding')) {
          break;
        }

        // Currency step: select Euro if the currency list is visible
        const euroOption = page.getByText('Euro', { exact: true });
        if (await euroOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await euroOption.click();
          await page.waitForTimeout(300);
        }

        // Try each button in priority order (longer timeout for page transitions)
        for (const testId of ['onboarding-go-to-dashboard', 'onboarding-skip', 'onboarding-next']) {
          const btn = page.getByTestId(testId);
          if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await btn.click();
            await page.waitForTimeout(500);
            break;
          }
        }
      }
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    }

    await use(page);
  },
});

export { expect };
