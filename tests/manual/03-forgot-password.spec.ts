import { createTestUserCredentials } from '../helpers/test-data';
import { e2eEnv } from '../setup/env';
import { expect, test } from './fixtures/manual.fixture';
import { ForgotPasswordPage } from './pages/forgot-password.page';
import { LoginPage } from './pages/login.page';
import { ResetPasswordPage } from './pages/reset-password.page';

test.describe('Forget password', () => {
  test('happy path — reset password via email link allows login with new password', async ({
    page,
    request,
    mailpit,
  }) => {
    const credentials = createTestUserCredentials(
      `manual-forgot-happy-${test.info().workerIndex}-${Date.now()}`
    );

    // Register user via API
    const regRes = await request.post(`${e2eEnv.apiUrl}/v2/auth/register`, {
      data: { name: credentials.name, email: credentials.email, password: credentials.password },
    });
    expect(regRes.ok(), `Register failed: ${await regRes.text()}`).toBeTruthy();

    await mailpit.purge();

    // Submit forgot-password form
    const forgotPage = new ForgotPasswordPage(page);
    await forgotPage.requestReset(credentials.email);
    await forgotPage.expectSentStateVisible();

    // Wait for the reset email
    const email = await mailpit.waitForMessage(
      (msg) =>
        msg.To.some((addr) => addr.Address === credentials.email) &&
        (msg.Subject.toLowerCase().includes('reset') ||
          msg.Subject.toLowerCase().includes('password')),
      { timeout: 30_000 }
    );

    // Extract reset token from email body
    const bodyText = (email as { Text?: string; HTML?: string }).Text || '';
    const bodyHtml = (email as { Text?: string; HTML?: string }).HTML || '';
    const source = bodyText || bodyHtml;

    const tokenMatch =
      source.match(/token=([A-Za-z0-9_-]+)/) ||
      source.match(/\/auth\/reset-password\?token=([A-Za-z0-9_-]+)/);
    expect(tokenMatch, 'Could not find reset token in email').toBeTruthy();
    const resetToken = tokenMatch![1];

    // Reset the password
    const newPassword = `New-Strong-Pass-${Date.now()}!Aa1`;
    const resetPage = new ResetPasswordPage(page);
    await resetPage.resetPassword(resetToken, newPassword);
    await resetPage.expectSuccessStateVisible();

    // Log in with the new password
    const loginPage = new LoginPage(page);
    await loginPage.login(credentials.email, newPassword);
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  });

  test('unregistered email shows the same sent state (no enumeration) and sends no email', async ({
    page,
    mailpit,
  }) => {
    const unregisteredEmail = `unregistered-${Date.now()}@example.test`;

    await mailpit.purge();

    const forgotPage = new ForgotPasswordPage(page);
    await forgotPage.requestReset(unregisteredEmail);
    await forgotPage.expectSentStateVisible();

    // Wait a moment then confirm no email was delivered
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    const delivered = await mailpit.searchMessages((msg) =>
      msg.To.some((addr) => addr.Address === unregisteredEmail)
    );
    expect(delivered, 'No email should be sent for an unregistered address').toBeNull();
  });
});
