import { createTestUserCredentials } from '../helpers/test-data';
import { e2eEnv } from '../setup/env';
import { expect, test } from './fixtures/manual.fixture';
import { RegistrationPage } from './pages/registration.page';

test.describe('Registration', () => {
  test('create a new user successfully', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-happy');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.register(credentials.name, credentials.email, credentials.password);
    await registrationPage.expectRedirectToOnboardingOrDashboard();
  });

  test('rejects registration with an empty name', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-invalid-name');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();
    await registrationPage.dismissCookieBanner();
    await registrationPage.fillName('');
    await registrationPage.fillEmail(credentials.email);
    await registrationPage.fillPassword(credentials.password);
    await registrationPage.fillConfirmPassword(credentials.password);
    await registrationPage.acceptTerms();

    await registrationPage.expectSubmitButtonDisabled();
  });

  test('rejects registration with an invalid name (only whitespace)', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-whitespace-name');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();
    await registrationPage.dismissCookieBanner();
    await registrationPage.fillName('   ');
    await registrationPage.fillEmail(credentials.email);
    await registrationPage.fillPassword(credentials.password);
    await registrationPage.fillConfirmPassword(credentials.password);
    await registrationPage.acceptTerms();

    await registrationPage.expectSubmitButtonDisabled();
  });

  test('rejects registration with an invalid name (special characters)', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-special-name');
    const registrationPage = new RegistrationPage(page);

    // The frontend only requires name.trim().length >= 1, so the button is enabled.
    // Submit with a name containing special characters and verify the API rejects it.
    await registrationPage.goto();
    await registrationPage.dismissCookieBanner();
    await registrationPage.fillName('@#$%^&*()');
    await registrationPage.fillEmail(credentials.email);
    await registrationPage.fillPassword(credentials.password);
    await registrationPage.fillConfirmPassword(credentials.password);
    await registrationPage.acceptTerms();
    await registrationPage.submit();

    await registrationPage.expectStillOnRegistration();
  });

  test('rejects registration with an invalid email', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-invalid-email');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();
    await registrationPage.dismissCookieBanner();
    await registrationPage.fillName(credentials.name);
    await registrationPage.fillEmail('not-an-email');
    await registrationPage.fillPassword(credentials.password);
    await registrationPage.fillConfirmPassword(credentials.password);
    await registrationPage.acceptTerms();

    await registrationPage.expectSubmitButtonDisabled();
  });

  test('rejects registration with a weak password', async ({ page }) => {
    const credentials = createTestUserCredentials('manual-reg-weak-password');
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();
    await registrationPage.dismissCookieBanner();
    await registrationPage.fillName(credentials.name);
    await registrationPage.fillEmail(credentials.email);
    await registrationPage.fillPassword('123');
    await registrationPage.fillConfirmPassword('123');
    await registrationPage.acceptTerms();

    await registrationPage.expectSubmitButtonDisabled();
  });

  test('rejects registration with an already registered email', async ({ page, request }) => {
    const credentials = createTestUserCredentials('manual-reg-duplicate-email');

    const firstResponse = await request.post(`${e2eEnv.apiUrl}/v2/auth/register`, {
      data: {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      },
    });
    expect(firstResponse.ok() || firstResponse.status() === 409).toBeTruthy();

    const registrationPage = new RegistrationPage(page);
    await registrationPage.register(credentials.name, credentials.email, credentials.password);

    await registrationPage.expectStillOnRegistration();
  });

  test('registration sends a welcome email', async ({ page, mailpit }) => {
    const credentials = createTestUserCredentials('manual-reg-email-check');

    await mailpit.purge();

    const registrationPage = new RegistrationPage(page);
    await registrationPage.register(credentials.name, credentials.email, credentials.password);
    await registrationPage.expectRedirectToOnboardingOrDashboard();

    const email = await mailpit.waitForMessage(
      (msg) => msg.To.some((addr) => addr.Address === credentials.email),
      { timeout: 15_000 }
    );

    expect(email.To.some((addr) => addr.Address === credentials.email)).toBeTruthy();
    expect(email.Subject.toLowerCase()).toContain('welcome');
    expect(email.From.Address).toMatch(/piggy.pulse|piggypulse/i);
  });
});
