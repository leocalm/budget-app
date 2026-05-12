import { test as base, expect, type Page } from 'playwright/test';
import { MailpitClient } from '../../helpers/mailpit';
import { createTestUserCredentials, type TestUserCredentials } from '../../helpers/test-data';
import { e2eEnv } from '../../setup/env';

/**
 * Manual E2E fixture — real API only.
 *
 * Provides:
 * - `registeredUser`: creates a user via direct API call with retry for rate limiting
 * - `loggedInPage`: navigates to login, authenticates, skips onboarding, returns authenticated Page
 * - `mailpit`: MailpitClient for querying the email sink
 *
 * No mock mode. Tests using this fixture require a running backend and Mailpit.
 */
interface ManualFixtures {
  registeredUser: TestUserCredentials;
  loggedInPage: Page;
  mailpit: MailpitClient;
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
      // Wait for the wizard to mount before driving it.
      await expect(page.getByTestId('onboarding-wizard')).toBeVisible({ timeout: 10000 });

      for (let i = 0; i < 20; i++) {
        if (!page.url().includes('/onboarding')) {
          break;
        }

        const goToDashboard = page.getByTestId('onboarding-go-to-dashboard');
        if (await goToDashboard.isVisible({ timeout: 200 }).catch(() => false)) {
          await goToDashboard.click();
          await page.waitForTimeout(500);
          continue;
        }

        const skip = page.getByTestId('onboarding-skip');
        if (await skip.isVisible({ timeout: 200 }).catch(() => false)) {
          await skip.click();
          await page.waitForTimeout(500);
          continue;
        }

        const next = page.getByTestId('onboarding-next');
        // Wait up to 5s for the next button on the current step to be ready.
        const nextVisible = await next.isVisible({ timeout: 5000 }).catch(() => false);
        if (!nextVisible) {
          break;
        }

        if (await next.isDisabled().catch(() => false)) {
          // Currency step requires picking a currency before Next enables.
          const firstCurrency = page.getByRole('radio').first();
          if (await firstCurrency.isVisible({ timeout: 2000 }).catch(() => false)) {
            await firstCurrency.click();
            // Wait for Next to enable.
            await expect(next).toBeEnabled({ timeout: 3000 });
          } else {
            break;
          }
        }

        await next.click();
        await page.waitForTimeout(500);
      }
    }

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await use(page);
  },

  // eslint-disable-next-line no-empty-pattern
  mailpit: async ({}, use) => {
    const client = new MailpitClient();
    await use(client);
  },
});

export { expect };
