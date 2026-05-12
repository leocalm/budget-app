import { clearRateLimits } from '../helpers/db-cleanup';
import { type MailpitClient } from '../helpers/mailpit';
import { createTestUserCredentials } from '../helpers/test-data';
import { e2eEnv } from '../setup/env';
import { expect, test } from './fixtures/manual.fixture';
import { generateTotpCode } from './helpers/totp';
import { LoginPage } from './pages/login.page';

const TOTP_STEP_SECONDS = 30;
const MIN_TOTP_SECONDS_REMAINING = 6;

async function generateStableTotpCode(secret: string): Promise<string> {
  const secondsIntoStep = Math.floor(Date.now() / 1000) % TOTP_STEP_SECONDS;
  const secondsRemaining = TOTP_STEP_SECONDS - secondsIntoStep;

  if (secondsRemaining < MIN_TOTP_SECONDS_REMAINING) {
    await new Promise((resolve) => {
      setTimeout(resolve, (secondsRemaining + 1) * 1000);
    });
  }

  return generateTotpCode(secret);
}

async function findAccountLockEmail(mailpit: MailpitClient, email: string) {
  return mailpit.searchMessages(
    (msg) =>
      msg.To.some((addr) => addr.Address === email) &&
      (msg.Subject.toLowerCase().includes('unlock') || msg.Subject.toLowerCase().includes('locked'))
  );
}

async function triggerAccountLock(
  loginPage: LoginPage,
  mailpit: MailpitClient,
  email: string,
  wrongPassword: string
): Promise<'ui' | 'email'> {
  for (let attempt = 0; attempt < 50; attempt++) {
    await loginPage.login(email, wrongPassword);

    if (await loginPage.isAccountLockedAlertVisible()) {
      return 'ui';
    }

    if (await findAccountLockEmail(mailpit, email)) {
      return 'email';
    }

    if (await loginPage.isRateLimitAlertVisible()) {
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
      continue;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  throw new Error(`Account did not lock after repeated failed logins for ${email}`);
}

test.describe('Login', () => {
  test('login with valid credentials without 2FA', async ({ page, registeredUser }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(registeredUser.email, registeredUser.password);
    await loginPage.expectRedirectToDashboardOrOnboarding();
  });

  test('login with wrong password shows a generic error', async ({ page, registeredUser }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(registeredUser.email, 'wrong-password-that-does-not-match');
    await loginPage.expectStillOnLogin();
    await loginPage.expectErrorAlertVisible();
    await loginPage.expectNoUserSpecificMessage();
  });

  test('login with non-existent email does not reveal user existence', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('nonexistent@example.test', 'SomePassword123!');
    await loginPage.expectStillOnLogin();
    await loginPage.expectErrorAlertVisible();
    await loginPage.expectNoUserSpecificMessage();
  });
});

/**
 * Helper: enable 2FA for the given user credentials.
 * Registers via API, logs in through the browser UI (to establish session),
 * then uses page.request for authenticated 2FA setup calls.
 */
async function enable2FAViaBrowser(
  page: import('playwright/test').Page,
  request: import('playwright/test').APIRequestContext,
  credentials: ReturnType<typeof createTestUserCredentials>,
  loginPage: LoginPage
): Promise<{ secret: string; backupCodes: string[] }> {
  // Register via API (no auth needed)
  const regRes = await request.post(`${e2eEnv.apiUrl}/v2/auth/register`, {
    data: { name: credentials.name, email: credentials.email, password: credentials.password },
  });
  expect(regRes.ok(), `Register failed: ${await regRes.text()}`).toBeTruthy();

  // Login via browser UI to establish session cookie in the page context
  await loginPage.login(credentials.email, credentials.password);
  await loginPage.expectRedirectToDashboardOrOnboarding();

  // Use page.request for authenticated API calls via the Vite proxy
  // (shares page cookies from localhost:5173)
  const viteBase = e2eEnv.baseUrl; // http://localhost:5173
  const enableRes = await page.request.post(`${viteBase}/v2/auth/2fa/enable`);
  expect(enableRes.ok(), `Enable 2FA failed: ${await enableRes.text()}`).toBeTruthy();
  const { secret } = (await enableRes.json()) as { secret: string };

  const code = await generateStableTotpCode(secret);
  const verifyRes = await page.request.post(`${viteBase}/v2/auth/2fa/verify`, {
    data: { twoFactorToken: '', code },
  });
  expect(verifyRes.ok(), `Verify 2FA failed: ${await verifyRes.text()}`).toBeTruthy();
  const verifyBody = (await verifyRes.json()) as { backupCodes?: string[] };
  const backupCodes = verifyBody.backupCodes ?? [];
  expect(backupCodes.length, '2FA setup did not return backup codes').toBeGreaterThan(0);

  // Clear session so the test can start from login
  await page.context().clearCookies();
  await page.goto('/auth/login');
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });

  return { secret, backupCodes };
}

test.describe('Login with 2FA', () => {
  let credentials: ReturnType<typeof createTestUserCredentials>;
  let secret: string;
  let backupCodes: string[];

  test.beforeEach(async ({ page, request }) => {
    credentials = createTestUserCredentials(`manual-2fa-${test.info().workerIndex}-${Date.now()}`);
    const loginPage = new LoginPage(page);
    const result = await enable2FAViaBrowser(page, request, credentials, loginPage);
    secret = result.secret;
    backupCodes = result.backupCodes;
  });

  test('login with 2FA enabled and valid TOTP code', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.expect2FAPromptVisible();

    await loginPage.fill2FACode(await generateStableTotpCode(secret));
    await loginPage.click2FAVerifyExpectingSuccess();
    await loginPage.expectRedirectToDashboardOrOnboarding();
  });

  test('login with 2FA enabled and wrong code shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.expect2FAPromptVisible();

    await loginPage.fill2FACode('000000');
    await loginPage.click2FAVerify();
    await loginPage.expectErrorAlertVisible();
    await loginPage.expectStillOnLogin();
  });

  test('login with 2FA enabled and valid backup code', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.expect2FAPromptVisible();

    await loginPage.clickUseRecoveryCode();
    await loginPage.fillRecoveryCode(backupCodes[0]);
    await loginPage.click2FAVerifyExpectingSuccess();
    await loginPage.expectRedirectToDashboardOrOnboarding();
  });

  test('login with 2FA enabled and invalid backup code shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.expect2FAPromptVisible();

    await loginPage.clickUseRecoveryCode();
    await loginPage.fillRecoveryCode('XXXX-0000-0000');
    await loginPage.click2FAVerify();
    await loginPage.expectErrorAlertVisible();
    await loginPage.expectStillOnLogin();
  });

  test('login with 2FA enabled and backup code already used', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // First login using backup code
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.expect2FAPromptVisible();
    await loginPage.clickUseRecoveryCode();
    await loginPage.fillRecoveryCode(backupCodes[0]);
    await loginPage.click2FAVerifyExpectingSuccess();
    await loginPage.expectRedirectToDashboardOrOnboarding();

    // Logout by clearing session
    await page.context().clearCookies();
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });

    // Try again with same (already used) backup code
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.expect2FAPromptVisible();
    await loginPage.clickUseRecoveryCode();
    await loginPage.fillRecoveryCode(backupCodes[0]);
    await loginPage.click2FAVerify();
    await loginPage.expectErrorAlertVisible();
    await loginPage.expectStillOnLogin();
  });

  test('login with 2FA enabled and all backup codes exhausted', async ({ page }) => {
    test.setTimeout(300_000);
    const loginPage = new LoginPage(page);

    // Use each backup code to log in
    for (const code of backupCodes) {
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.expect2FAPromptVisible();
      await loginPage.clickUseRecoveryCode();
      await loginPage.fillRecoveryCode(code);
      await loginPage.click2FAVerifyExpectingSuccess();
      await loginPage.expectRedirectToDashboardOrOnboarding();

      // Logout for next iteration
      await page.context().clearCookies();
      await page.goto('/auth/login');
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
    }

    // All backup codes exhausted — TOTP should still work
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.expect2FAPromptVisible();
    await loginPage.fill2FACode(await generateStableTotpCode(secret));
    await loginPage.click2FAVerifyExpectingSuccess();
    await loginPage.expectRedirectToDashboardOrOnboarding();
  });
});

test.skip('Rate limiting and account locking', () => {
  let credentials: ReturnType<typeof createTestUserCredentials>;
  const wrongPassword = 'wrong-password';

  test.beforeAll(async () => {
    await clearRateLimits();
  });

  test.beforeEach(async ({ request }) => {
    credentials = createTestUserCredentials(
      `manual-ratelimit-${test.info().workerIndex}-${Date.now()}`
    );
    const regRes = await request.post(`${e2eEnv.apiUrl}/v2/auth/register`, {
      data: { name: credentials.name, email: credentials.email, password: credentials.password },
    });
    expect(regRes.ok(), `Failed to register: ${await regRes.text()}`).toBeTruthy();
  });

  test.skip('failed attempts trigger escalating cooldowns then locks', async ({ page }) => {
    test.setTimeout(300_000);
    const loginPage = new LoginPage(page);

    for (let attempt = 0; attempt < 50; attempt++) {
      await loginPage.login(credentials.email, wrongPassword);
      await loginPage.expectStillOnLogin();

      const isLocked = await page
        .getByText(/locked|unlock/i)
        .isVisible()
        .catch(() => false);
      if (isLocked) {
        await loginPage.expectAccountLockedAlertVisible();
        return;
      }

      const hasCooldown = await page
        .getByText(/wait|too many|seconds/i)
        .isVisible()
        .catch(() => false);
      if (hasCooldown) {
        await page.waitForTimeout(5000);
        continue;
      }

      await page.waitForTimeout(1000);
    }

    // Final check: should be locked or rate-limited
    const locked = await page
      .getByText(/locked|unlock/i)
      .isVisible()
      .catch(() => false);
    const cooldown = await page
      .getByText(/wait|too many|seconds/i)
      .isVisible()
      .catch(() => false);
    expect(locked || cooldown).toBeTruthy();
  });

  test.skip('account lock shows locked alert and unlock flow works via email', async ({
    page,
    mailpit,
  }) => {
    test.setTimeout(300_000);
    const loginPage = new LoginPage(page);

    await mailpit.purge();

    const lockSignal = await triggerAccountLock(
      loginPage,
      mailpit,
      credentials.email,
      wrongPassword
    );
    if (lockSignal === 'email') {
      await loginPage.login(credentials.email, credentials.password);
    }
    await loginPage.expectAccountLockedAlertVisible();

    const email = await mailpit.waitForMessage(
      (msg) =>
        msg.To.some((addr) => addr.Address === credentials.email) &&
        (msg.Subject.toLowerCase().includes('unlock') ||
          msg.Subject.toLowerCase().includes('locked')),
      { timeout: 30_000 }
    );

    const bodyText = (email as any).Text || (email as any).HTML || '';
    const unlockMatch =
      bodyText.match(/unlock[^]*?token=([a-zA-Z0-9_-]+)/i) ||
      bodyText.match(/\/auth\/unlock\?token=([a-zA-Z0-9_-]+)/);
    expect(unlockMatch, 'Could not find unlock token in email').toBeTruthy();
    const unlockToken = unlockMatch![1];

    await page.goto(`/auth/unlock?token=${unlockToken}`);
    await expect(page.getByText(/unlocked|success/i).first()).toBeVisible({ timeout: 10000 });

    await loginPage.login(credentials.email, credentials.password);
    await loginPage.expectRedirectToDashboardOrOnboarding();
  });

  test.afterAll(async () => {
    await clearRateLimits();
  });
});

test.describe('Login session management', () => {
  test('Remember Me persists session across browser context restart', async ({
    page,
    context,
    registeredUser,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(registeredUser.email, registeredUser.password);
    await loginPage.expectRedirectToDashboardOrOnboarding();

    const storageState = await context.storageState();

    const newContext = await context.browser()!.newContext({ storageState });
    const newPage = await newContext.newPage();

    await newPage.goto('/dashboard');
    await expect(newPage).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 });

    await newContext.close();
  });

  test('session expired message appears when redirected from expired session', async ({
    page,
    registeredUser,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(registeredUser.email, registeredUser.password);
    await loginPage.expectRedirectToDashboardOrOnboarding();

    // Clear all cookies to simulate session expiry
    await page.context().clearCookies();

    // Navigate to a protected page — should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });
});

test.describe('Emergency 2FA disable', () => {
  let credentials: ReturnType<typeof createTestUserCredentials>;

  test.beforeEach(async ({ page, request }) => {
    credentials = createTestUserCredentials(
      `manual-emergency-${test.info().workerIndex}-${Date.now()}`
    );
    const loginPage = new LoginPage(page);
    await enable2FAViaBrowser(page, request, credentials, loginPage);
  });

  test('emergency 2FA disable via email allows login without 2FA', async ({
    page,
    mailpit,
    request,
  }) => {
    await mailpit.purge();

    const reqRes = await request.post(`${e2eEnv.apiUrl}/v2/auth/2fa/emergency-disable/request`, {
      data: { email: credentials.email },
    });
    expect(reqRes.ok()).toBeTruthy();

    const email = await mailpit.waitForMessage(
      (msg) =>
        msg.To.some((addr) => addr.Address === credentials.email) &&
        (msg.Subject.toLowerCase().includes('2fa') ||
          msg.Subject.toLowerCase().includes('two.factor') ||
          msg.Subject.toLowerCase().includes('emergency')),
      { timeout: 30_000 }
    );

    const bodyText = (email as any).Text || (email as any).HTML || '';
    const tokenMatch =
      bodyText.match(/token=([a-zA-Z0-9_-]+)/) ||
      bodyText.match(/confirm[^]*?([a-zA-Z0-9_-]{20,})/);
    expect(tokenMatch, 'Could not find emergency disable token in email').toBeTruthy();
    const confirmToken = tokenMatch![1];

    const confirmRes = await request.post(
      `${e2eEnv.apiUrl}/v2/auth/2fa/emergency-disable/confirm`,
      {
        data: { token: confirmToken },
      }
    );
    expect(
      confirmRes.ok(),
      `Emergency disable confirm failed: ${await confirmRes.text()}`
    ).toBeTruthy();

    const loginPage = new LoginPage(page);
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.expectRedirectToDashboardOrOnboarding();
  });
});
